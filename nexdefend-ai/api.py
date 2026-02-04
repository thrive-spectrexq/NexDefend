import os
import logging
import time
import requests
import nmap
import functools
import secrets
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from prometheus_client import Counter, make_wsgi_app, Histogram
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from pydantic import BaseModel, ValidationError, Field, validator
from typing import Optional, List, Dict, Any
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

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
    score_anomalies,
    train_model,
)
# IMPORT NEW MODULES
from llm_handler import llm_agent
from forecasting import generate_forecast
from advanced_threat_detection import analyze_process_tree

init_tracer_provider()

app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)

# Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

def require_auth(f):
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
             return make_response(jsonify({"error": "Unauthorized"}), 401)

        token = auth_header.replace("Bearer ", "")
        expected_token = app.config['AI_SERVICE_TOKEN']

        if not secrets.compare_digest(token, expected_token):
            return make_response(jsonify({"error": "Unauthorized"}), 401)
        return f(*args, **kwargs)
    return decorated_function

# Metrics Setup
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, { '/metrics': make_wsgi_app() })
cors_env = os.getenv("CORS_ALLOWED_ORIGINS")
if cors_env:
    cors_origins = cors_env.split(",")
else:
    cors_origins = []
CORS(app, origins=cors_origins)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

ai_token = os.getenv("AI_SERVICE_TOKEN")
if not ai_token:
    logging.error("AI_SERVICE_TOKEN environment variable is not set. Exiting.")
    import sys
    sys.exit(1)
if ai_token == "default_secret_token":
    logging.warning("Security Warning: Using default AI_SERVICE_TOKEN.")

app.config["AI_SERVICE_TOKEN"] = ai_token

# Support both CORE_API_URL and GO_API_URL for compatibility
CORE_API_URL = os.getenv("CORE_API_URL") or os.getenv("GO_API_URL")
if not CORE_API_URL:
    logging.error("CORE_API_URL (or GO_API_URL) environment variable is not set. Exiting.")
    import sys
    sys.exit(1)

# Internal Counters
EVENTS_PROCESSED = Counter('events_processed_total', 'Total events processed')
ANOMALIES_DETECTED = Counter('anomalies_detected_total', 'Total anomalies detected')
INCIDENTS_CREATED = Counter('incidents_created_total', 'Total incidents created')

# --- Pydantic Models ---

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    context: Optional[Dict[str, Any]] = None

class VerifyThreatRequest(BaseModel):
    payload: str = Field(..., min_length=1)
    patterns: List[str]
    score: float

class ScanRequest(BaseModel):
    target: str

    @validator('target')
    def validate_target(cls, v):
        if not v or ';' in v or ' ' in v or '&' in v:
            raise ValueError('Invalid target format')
        return v

# --- Routes ---

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "nexdefend-ai"})

# 1. GenAI Chat Endpoint
@app.route('/chat', methods=['POST'])
@require_auth
@limiter.limit("10 per minute")
def chat():
    try:
        # Validate input
        if not request.is_json:
             return jsonify({"error": "Request body must be JSON"}), 400

        try:
            req_data = ChatRequest(**request.get_json())
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        query = req_data.query
        context = req_data.context

        # Allowlist filtering for context
        safe_context = {}
        if context:
            allowed_keys = {
                "description", "severity", "status", "created_at",
                "source_ip", "destination_ip", "protocol", "alert_signature",
                "id", "category"
            }
            for k, v in context.items():
                if k in allowed_keys:
                    safe_context[k] = v

        # Use the dedicated handler
        response_text = llm_agent.generate_response(query, safe_context)
        return jsonify({"response": response_text})
    except Exception as e:
        logging.error(f"Chat error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/verify-threat', methods=['POST'])
@require_auth
@limiter.limit("20 per minute")
def verify_threat():
    try:
        if not request.is_json:
             return jsonify({"error": "Request body must be JSON"}), 400

        try:
            req_data = VerifyThreatRequest(**request.get_json())
        except ValidationError as e:
             return jsonify({"error": e.errors()}), 400

        payload = req_data.payload
        patterns = req_data.patterns
        score = req_data.score

        # Construct a specific prompt for threat verification
        prompt = (
            f"I have detected a potential threat (Score: {score}) matching these patterns: {patterns}. "
            f"The payload is: '{payload}'. "
            "Analyze this specific payload. Explain why it is dangerous or if it is a false positive. "
            "Be extremely concise."
        )

        response_text = llm_agent.generate_response(prompt)
        return jsonify({"analysis": response_text})
    except Exception as e:
        logging.error(f"Verify threat error: {e}")
        return jsonify({"error": str(e)}), 500

# 2. Forecasting Endpoint
@app.route('/forecast', methods=['GET'])
@require_auth
def get_forecast():
    try:
        metric = request.args.get('metric', 'cpu_load')
        # Call the improved forecasting engine
        prediction = generate_forecast(metric)
        if isinstance(prediction, dict) and "error" in prediction:
             return jsonify(prediction), 400
        return jsonify({"forecast": prediction})
    except Exception as e:
        logging.error(f"Forecast error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-playbook', methods=['POST'])
@require_auth
def generate_playbook():
    try:
        data = request.get_json()
        threat_context = data.get("context", "Suspicious activity detected")
        score = data.get("score", 0)

        # In a real scenario, this would use the LLM to generate a complex plan
        # For now, we'll provide a structured AI-driven remediation template
        playbook = [
            {"step": 1, "action": "BLOCK_PROCESS", "description": "Terminate the identified malicious process"},
            {"step": 2, "action": "ISOLATE_NETWORK", "description": "Restrict network access for the affected host"},
            {"step": 3, "action": "NOTIFY_SEC_OPS", "description": "Alert the security operations team via Matrix/Email"}
        ]

        if score > 80:
            playbook.append({"step": 4, "action": "FULL_SNAPSHOT", "description": "Trigger a full forensic memory snapshot"})

        return jsonify({
            "playbook": playbook,
            "threat_analysis": f"Confidence high for automated remediation based on score {score}"
        })
    except Exception as e:
        logging.error(f"Playbook generation error: {e}")
        return jsonify({"error": str(e)}), 500

# 3. Anomaly Detection (Existing)
@app.route("/analyze-event/<int:event_id>", methods=["POST"])
@require_auth
def analyze_single_event(event_id):
    try:
        event = fetch_suricata_event_by_id(event_id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        features = preprocess_events([event], is_training=False)
        anomaly_result = detect_anomalies(features)

        EVENTS_PROCESSED.inc()

        update_event_analysis_status(event_id, True)

        is_anomaly = False
        if len(anomaly_result) > 0 and anomaly_result[0] == -1:
            is_anomaly = True
            ANOMALIES_DETECTED.inc()

            # Trigger Incident Creation in Core API
            try:
                # Safely handle sqlite3.Row and potentially None alert
                # Convert row to dict
                if isinstance(event, dict):
                    event_dict = event
                elif hasattr(event, 'keys'):
                     # sqlite3.Row supports keys() and iteration over values
                    event_dict = dict(zip(event.keys(), event))
                else:
                    event_dict = dict(event)

                alert_data = event_dict.get('alert')

                if not alert_data:
                    alert_data = {}
                elif isinstance(alert_data, str):
                    try:
                        import json
                        alert_data = json.loads(alert_data)
                    except:
                        pass

                if not isinstance(alert_data, dict):
                    alert_data = {}

                signature = alert_data.get('signature', 'Unknown Alert')

                requests.post(f'{CORE_API_URL}/incidents', json={
                    "description": f"AI Anomaly Detected: {signature}",
                    "severity": "Critical",
                    "related_event_id": event_id
                }, timeout=10)
                INCIDENTS_CREATED.inc()
            except Exception as req_err:
                logging.error(f"Failed to create incident: {req_err}")

        return jsonify({"status": "analyzed", "event_id": event_id, "is_anomaly": is_anomaly})
    except Exception as e:
        logging.error(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500

# 4. Training (Existing)
@app.route("/train", methods=["POST"])
@require_auth
def train():
    try:
        events = fetch_all_suricata_events()
        if not events:
            return jsonify({"message": "No events to train."}), 404
        features = preprocess_events(events, is_training=True)
        train_model(features)
        return jsonify({"message": "Training complete"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 5. Scan Endpoint (Restored)
@app.route('/scan', methods=['POST'])
@require_auth
@limiter.limit("5 per minute")
def scan_host():
    try:
        if not request.is_json:
             return jsonify({"error": "Request body must be JSON"}), 400

        try:
            req_data = ScanRequest(**request.get_json())
        except ValidationError as e:
            return jsonify({"error": e.errors()}), 400

        target = req_data.target

        try:
            nm = nmap.PortScanner()
            nm.scan(target, arguments='-sV')

            open_ports = []
            for host in nm.all_hosts():
                for proto in nm[host].all_protocols():
                    lport = nm[host][proto].keys()
                    for port in lport:
                        state = nm[host][proto][port]['state']
                        if state == 'open':
                             service = nm[host][proto][port]['name']
                             open_ports.append(f"{port}/{service}")

                             # Report Vulnerability to Core API
                             try:
                                 requests.post(f'{CORE_API_URL}/vulnerabilities', json={
                                     "description": f"Open port discovered: {port}/{service}",
                                     "severity": "High",
                                     "host": target
                                 }, timeout=10)
                             except Exception as req_err:
                                 logging.error(f"Failed to report vulnerability: {req_err}")

        return jsonify({"status": "Scan complete", "open_ports": open_ports})
    except Exception as e:
        logging.error(f"Scan error: {e}")
        return jsonify({"error": str(e)}), 500

# 6. API Metrics (Restored)
@app.route('/api-metrics', methods=['GET'])
def api_metrics():
    return jsonify({
        "events_processed": EVENTS_PROCESSED._value.get(),
        "anomalies_detected": ANOMALIES_DETECTED._value.get(),
        "incidents_created": INCIDENTS_CREATED._value.get()
    })

# 7. Score Endpoint (Restored)
@app.route('/score', methods=['POST'])
@require_auth
def score_event():
    try:
        data = request.get_json()
        features = preprocess_events([data], is_training=False)
        scores = score_anomalies(features)
        score_val = scores[0] if len(scores) > 0 else 0
        return jsonify({"score": score_val})
    except Exception as e:
        logging.error(f"Score error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
