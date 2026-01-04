import os
import logging
import requests
import os
import re
import logging
import requests
import nmap
import time
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from prometheus_client import Counter, make_wsgi_app, Gauge, Histogram
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from opentelemetry.instrumentation.flask import FlaskInstrumentor

from telemetry import init_tracer_provider
from data_ingestion import (
    fetch_unprocessed_suricata_events,
    fetch_suricata_event_by_id,
    update_event_analysis_status,
    fetch_all_suricata_events,
    EVENT_COLUMNS
)
from ml_anomaly_detection import (
    detect_anomalies,
    preprocess_events,
    predict_real_time,
    score_anomalies,
    train_model,
)

init_tracer_provider()

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

app.wsgi_app = DispatcherMiddleware(app.wsgi_app, { '/metrics': make_wsgi_app() })
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
CORS(app, origins=cors_origins)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
GO_API_URL = os.getenv("GO_API_URL", "http://localhost:8080/api/v1")
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "default_secret_token")

# Existing Metrics
EVENTS_PROCESSED = Counter('events_processed_total', 'Total number of events processed')
ANOMALIES_DETECTED = Counter('anomalies_detected_total', 'Total number of anomalies detected')
INCIDENTS_CREATED = Counter('incidents_created_total', 'Total number of incidents automatically created')
HOSTS_SCANNED = Counter('hosts_scanned_total', 'Total number of hosts scanned')
VULNS_DISCOVERED = Counter('vulnerabilities_discovered_total', 'Total vulnerabilities discovered by scanning')

# New Metrics
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency', ['method', 'endpoint'])
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status_code'])
ANOMALIES_DETECTED_CUSTOM = Counter('nexdefend_ai_anomalies_detected_total', 'Total number of anomalies detected', ['model', 'host'])
MODEL_INFERENCE_DURATION = Histogram('nexdefend_ai_model_inference_duration_seconds', 'Model inference duration', ['model'])

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    latency = time.time() - request.start_time
    REQUEST_LATENCY.labels(request.method, request.path).observe(latency)
    REQUEST_COUNT.labels(request.method, request.path, response.status_code).inc()
    return response

def create_incident_in_backend(event_dict):
    try:
        alert_info = event_dict.get('alert') or {}
        description = f"AI Anomaly Detected: {alert_info.get('signature', 'No signature')}"
        alert_severity = alert_info.get('severity', 3)
        severity_map = {1: "Critical", 2: "High", 3: "Medium"}
        severity = severity_map.get(alert_severity, "Low")

        payload = {
            "description": description,
            "severity": severity,
            "status": "Open",
            "related_event_id": event_dict.get('id')
        }
        headers = {
            "Authorization": f"Bearer {AI_SERVICE_TOKEN}",
            "Content-Type": "application/json"
        }
        incident_url = f"{GO_API_URL}/incidents"
        response = requests.post(incident_url, json=payload, headers=headers)
        
        if response.status_code == 201:
            logging.info(f"Successfully created incident for event {event_dict.get('id')}")
            INCIDENTS_CREATED.inc()
        else:
            logging.error(f"Failed to create incident for event {event_dict.get('id')}. Status: {response.status_code}, Body: {response.text}")
    except Exception as e:
        logging.error(f"Error calling create_incident_in_backend: {e}")

def create_vulnerability_in_backend(host, port, service_name):
    try:
        description = f"Open port discovered: {port}/{service_name}"
        
        severity = "Medium"
        if str(port) in ["22", "3389"]:
            severity = "High"
        elif str(port) in ["21", "23"]:
            severity = "Critical"

        payload = {
            "description": description,
            "severity": severity,
            "host_ip": host,
            "port": int(port)
        }
        
        headers = {
            "Authorization": f"Bearer {AI_SERVICE_TOKEN}",
            "Content-Type": "application/json"
        }
        
        vuln_url = f"{GO_API_URL}/vulnerabilities"
        response = requests.post(vuln_url, json=payload, headers=headers)
        
        if response.status_code == 201:
            logging.info(f"Successfully created vulnerability for {host}:{port}")
            VULNS_DISCOVERED.inc()
        else:
            logging.warning(f"Failed to create vulnerability for {host}:{port}. Status: {response.status_code}, Body: {response.text}")
            
    except Exception as e:
        logging.error(f"Error calling create_vulnerability_in_backend: {e}")

@app.route("/train", methods=["POST"])
def train():
    try:
        start_time = time.time()
        events = fetch_all_suricata_events()
        if not events:
            return make_response(jsonify({"message": "No events found to train on."}), 404)
        features = preprocess_events(events, is_training=True)
        train_model(features)
        MODEL_INFERENCE_DURATION.labels(model="isolation_forest").observe(time.time() - start_time)
        return make_response(jsonify({"message": f"Model training successful on {len(events)} events."}), 200)
    except Exception as e:
        logging.error(f"Error during model training: {e}")
        return make_response(jsonify({"error": "Failed to train model"}), 500)

@app.route("/analyze-event/<int:event_id>", methods=["POST"])
def analyze_single_event(event_id):
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or auth_header != f"Bearer {app.config['AI_SERVICE_TOKEN']}":
            logging.warning(f"Unauthorized analysis attempt for event {event_id}")
            return make_response(jsonify({"error": "Unauthorized"}), 401)
        event = fetch_suricata_event_by_id(event_id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)
        features = preprocess_events([event], is_training=False)
        start_time = time.time()
        anomaly_result = detect_anomalies(features)
        MODEL_INFERENCE_DURATION.labels(model="isolation_forest").observe(time.time() - start_time)
        update_event_analysis_status(event_id, True)
        EVENTS_PROCESSED.inc()
        is_anomaly = False
        if len(anomaly_result) > 0 and anomaly_result[0] == -1:
            is_anomaly = True
            ANOMALIES_DETECTED.inc()
            event_dict = dict(zip(EVENT_COLUMNS, event))
            ANOMALIES_DETECTED_CUSTOM.labels(model="isolation_forest", host=event_dict.get("src_ip", "unknown")).inc()
            create_incident_in_backend(event_dict)
        return make_response(jsonify({"event_id": event_id, "is_anomaly": is_anomaly}), 200)
    except Exception as e:
        logging.error(f"Error during single event analysis for event {event_id}: {e}")
        return make_response(jsonify({"error": "Failed to analyze event"}), 500)

@app.route("/scan", methods=["POST"])
def scan_host():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or auth_header != f"Bearer {app.config['AI_SERVICE_TOKEN']}":
            logging.warning("Unauthorized scan attempt")
            return make_response(jsonify({"error": "Unauthorized"}), 401)

        data = request.get_json()
        target = data.get('target')
        if not target:
            return make_response(jsonify({"error": "Target IP is required"}), 400)

        # Sanitize target to prevent command injection.
        # This regex allows IPv4, IPv6, and valid hostnames.
        if not re.match(r"^[a-zA-Z0-9\.\-:]{1,253}$", target):
            logging.warning(f"Invalid target format: {target}")
            return make_response(jsonify({"error": "Invalid target format"}), 400)
        
        logging.info(f"Starting Nmap scan on target: {target}")
        
        try:
            nm = nmap.PortScanner()
            nm.scan(target, '21-1024') 
            
            if target not in nm.all_hosts():
                logging.info(f"Host {target} is down or not responding.")
                return make_response(jsonify({"status": "Host is down or not responding"}), 200)
                
            open_ports = []
            if 'tcp' in nm[target]:
                for port in nm[target]['tcp']:
                    port_info = nm[target]['tcp'][port]
                    if port_info['state'] == 'open':
                        service_name = port_info.get('name', 'unknown')
                        open_ports.append({"port": port, "service": service_name})
                        create_vulnerability_in_backend(target, port, service_name)
            
            HOSTS_SCANNED.inc()
            logging.info(f"Scan complete for {target}. Found {len(open_ports)} open ports.")
            return make_response(jsonify({"status": "Scan complete", "host": target, "open_ports": open_ports}), 200)

        except nmap.nmap.PortScannerError as e:
            logging.error(f"Nmap scan error for {target}: {e}")
            return make_response(jsonify({"error": "Scan failed. Is nmap installed?"}), 500)
            
    except Exception as e:
        logging.error(f"Error during scan: {e}")
        return make_response(jsonify({"error": "Failed to perform scan"}), 500)

@app.route("/anomalies", methods=["GET"])
def get_batch_anomalies():
    try:
        events = fetch_unprocessed_suricata_events()
        if not events:
            return make_response(jsonify({"anomalies": []}), 200)
        features = preprocess_events(events, is_training=False)
        start_time = time.time()
        anomalies = detect_anomalies(features)
        MODEL_INFERENCE_DURATION.labels(model="isolation_forest").observe(time.time() - start_time)
        event_ids = [event[0] for event in events]
        anomaly_map = [
            {"event_id": event_ids[i], "is_anomaly": True if anomaly == -1 else False}
            for i, anomaly in enumerate(anomalies)
        ]
        return make_response(jsonify({"anomalies": anomaly_map}), 200)
    except Exception as e:
        logging.error(f"Error during batch anomaly detection: {e}")
        return make_response(jsonify({"error": "Failed to detect batch anomalies"}), 500)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        start_time = time.time()
        prediction = predict_real_time(data)
        MODEL_INFERENCE_DURATION.labels(model="isolation_forest").observe(time.time() - start_time)
        return make_response(jsonify(prediction), 200)
    except Exception as e:
        logging.error(f"Error during real-time prediction: {e}")
        return make_response(jsonify({"error": "Failed to make real-time prediction"}), 500)

@app.route("/score", methods=["POST"])
def score():
    try:
        data = request.get_json()
        features = preprocess_events([data], is_training=False)
        start_time = time.time()
        score = score_anomalies(features)
        MODEL_INFERENCE_DURATION.labels(model="isolation_forest").observe(time.time() - start_time)
        return make_response(jsonify({"score": score[0]}), 200)
    except Exception as e:
        logging.error(f"Error during real-time scoring: {e}")
        return make_response(jsonify({"error": "Failed to make real-time score"}), 500)

@app.route("/api-metrics", methods=["GET"])
def get_api_metrics():
    metrics = {
        "events_processed": EVENTS_PROCESSED._value.get(),
        "anomalies_detected": ANOMALIES_DETECTED._value.get(),
        "incidents_created": INCIDENTS_CREATED._value.get(),
        "hosts_scanned": HOSTS_SCANNED._value.get(),
        "vulnerabilities_discovered": VULNS_DISCOVERED._value.get()
    }
    return make_response(jsonify(metrics), 200)

@app.route("/chat", methods=["POST"])
def chat_copilot():
    try:
        data = request.get_json()
        query = data.get("query")
        if not query:
            return make_response(jsonify({"error": "Query is required"}), 400)

        # In a real implementation, this would:
        # 1. Fetch context from OpenSearch/Prometheus based on entities in the query (e.g., "server-01").
        # 2. Construct a prompt for the LLM.
        # 3. Call OpenAI/Ollama API.

        # For this demonstration/MVP, we mock the intelligence.
        logging.info(f"Received Sentinel Query: {query}")

        response_text = ""

        if "cpu" in query.lower() and "spike" in query.lower():
            response_text = "Correlating metrics... The spike coincides with a generic massive log ingestion from IP 192.168.1.50. This looks like a potential DoS attack. Recommended Action: Block IP."
        elif "slow" in query.lower() and "server" in query.lower():
             response_text = "Analyzing latency... Database query times on 'db-prod-01' have increased by 400% in the last hour. Possible index fragmentation or unoptimized query detected."
        elif "malware" in query.lower() or "virus" in query.lower():
             response_text = "Scanning recent alerts... Found critical alert 'Suspicious PowerShell Execution' on host 'hr-workstation-05'. Parent process: explorer.exe. This matches known Emotet behavior."
        else:
             response_text = "I'm analyzing the system state. Can you specify which host or metric you are concerned about?"

        return make_response(jsonify({"response": response_text}), 200)

    except Exception as e:
        logging.error(f"Error in chat copilot: {e}")
        return make_response(jsonify({"error": "Failed to process chat query"}), 500)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
