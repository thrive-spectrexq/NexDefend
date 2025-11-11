import logging
import os
import requests
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from prometheus_client import Counter, make_wsgi_app, Gauge
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from data_ingestion import (
    fetch_unprocessed_suricata_events,
    fetch_suricata_event_by_id,
    update_event_analysis_status,
    fetch_all_suricata_events,
    EVENT_COLUMNS # Import column list
)
from ml_anomaly_detection import (
    detect_anomalies,
    preprocess_events,
    predict_real_time,
    train_model,
)

app = Flask(__name__)

# --- Configuration ---
# Add prometheus wsgi middleware to route /metrics requests
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
    '/metrics': make_wsgi_app()
})

# Enable CORS for all origins
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
CORS(app, origins=cors_origins)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Get Go API URL and Auth Token from environment
GO_API_URL = os.getenv("GO_API_URL", "http://localhost:8080/api/v1")
AI_SERVICE_TOKEN = os.getenv("AI_SERVICE_TOKEN", "default_secret_token") # This MUST match the Go backend config

# --- Prometheus Metrics ---
EVENTS_PROCESSED = Counter('events_processed_total', 'Total number of events processed')
ANOMALIES_DETECTED = Counter('anomalies_detected_total', 'Total number of anomalies detected')
INCIDENTS_CREATED = Counter('incidents_created_total', 'Total number of incidents automatically created')

# --- Helper Function for Automated Response ---
def create_incident_in_backend(event_dict):
    """Calls the Go backend to create a new incident."""
    try:
        alert_info = event_dict.get('alert') or {}
        description = f"AI Anomaly Detected: {alert_info.get('signature', 'No signature')}"
        
        # Determine severity
        alert_severity = alert_info.get('severity', 3) # Default to medium-low
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


# --- API Endpoints ---

@app.route("/train", methods=["POST"])
def train():
    """Trains the ML model using all data in the database."""
    try:
        events = fetch_all_suricata_events()
        if not events:
            return make_response(jsonify({"message": "No events found to train on."}), 404)
        
        features = preprocess_events(events, is_training=True)
        train_model(features)
        return make_response(jsonify({"message": f"Model training successful on {len(events)} events."}), 200)
    except Exception as e:
        logging.error(f"Error during model training: {e}")
        return make_response(jsonify({"error": "Failed to train model"}), 500)

@app.route("/analyze-event/<int:event_id>", methods=["POST"])
def analyze_single_event(event_id):
    """Analyzes a single event and creates an incident if it's an anomaly."""
    try:
        # Check for service-to-service auth
        auth_header = request.headers.get("Authorization")
        if not auth_header or auth_header != f"Bearer {AI_SERVICE_TOKEN}":
            logging.warning(f"Unauthorized analysis attempt for event {event_id}")
            return make_response(jsonify({"error": "Unauthorized"}), 401)

        event = fetch_suricata_event_by_id(event_id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        # The preprocessing function expects a list of events
        features = preprocess_events([event], is_training=False)
        anomaly_result = detect_anomalies(features)

        # Update the event's status to analyzed
        update_event_analysis_status(event_id, True)
        EVENTS_PROCESSED.inc()
        
        is_anomaly = False
        if len(anomaly_result) > 0 and anomaly_result[0] == -1:
            is_anomaly = True
            ANOMALIES_DETECTED.inc()
            
            # --- AUTOMATED RESPONSE ---
            # Convert tuple to dict for easier processing
            event_dict = dict(zip(EVENT_COLUMNS, event))
            create_incident_in_backend(event_dict)
            # --- End Automated Response ---

        return make_response(jsonify({"event_id": event_id, "is_anomaly": is_anomaly}), 200)

    except Exception as e:
        logging.error(f"Error during single event analysis for event {event_id}: {e}")
        return make_response(jsonify({"error": "Failed to analyze event"}), 500)

@app.route("/anomalies", methods=["GET"])
def get_batch_anomalies():
    """(Frontend) Gets anomaly predictions for all unprocessed events."""
    try:
        events = fetch_unprocessed_suricata_events()
        if not events:
            return make_response(jsonify({"anomalies": []}), 200)
            
        features = preprocess_events(events, is_training=False)
        anomalies = detect_anomalies(features)
        
        # Map anomalies back to event IDs
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
    """(Not currently used) Predicts a single raw event object."""
    try:
        data = request.get_json()
        # Data must be in the same format as a DB row tuple
        # This endpoint is less useful now that we trigger by ID
        prediction = predict_real_time(data)
        return make_response(jsonify(prediction), 200)
    except Exception as e:
        logging.error(f"Error during real-time prediction: {e}")
        return make_response(jsonify({"error": "Failed to make real-time prediction"}), 500)

@app.route("/api-metrics", methods=["GET"])
def get_api_metrics():
    """(Frontend) Gets Prometheus metrics for the AI dashboard."""
    metrics = {
        "events_processed": EVENTS_PROCESSED._value.get(),
        "anomalies_detected": ANOMALIES_DETECTED._value.get(),
        "incidents_created": INCIDENTS_CREATED._value.get()
    }
    return make_response(jsonify(metrics), 200)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
