import logging
import os
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from prometheus_client import Counter, make_wsgi_app, Gauge
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from analysis import analyze_data
from data_ingestion import (
    fetch_unprocessed_suricata_events,
    fetch_suricata_event_by_id,
    update_event_analysis_status,
)
from ml_anomaly_detection import detect_anomalies, preprocess_events, predict_real_time

app = Flask(__name__)

# Add prometheus wsgi middleware to route /metrics requests
app.wsgi_app = DispatcherMiddleware(app.wsgi_app, {
    '/metrics': make_wsgi_app()
})


# Enable CORS for all origins
cors_origins = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
CORS(app, origins=cors_origins)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Define Prometheus metrics
EVENTS_PROCESSED = Counter('events_processed_total', 'Total number of events processed')
ANOMALIES_DETECTED = Counter('anomalies_detected_total', 'Total number of anomalies detected')

@app.route("/analysis", methods=["GET"])
def get_analysis():
    try:
        events = fetch_unprocessed_suricata_events()
        analysis = analyze_data(events)
        return make_response(jsonify(analysis), 200)
    except Exception as e:
        logging.error(f"Error during batch analysis: {e}")
        return make_response(jsonify({"error": "Failed to perform batch analysis"}), 500)

@app.route("/anomalies", methods=["GET"])
def get_batch_anomalies():
    try:
        events = fetch_unprocessed_suricata_events()
        features = preprocess_events(events)
        anomalies = detect_anomalies(features)
        # Here, you might want to associate anomalies back to specific events
        return make_response(jsonify({"anomalies": anomalies.tolist()}), 200)
    except Exception as e:
        logging.error(f"Error during batch anomaly detection: {e}")
        return make_response(jsonify({"error": "Failed to detect batch anomalies"}), 500)

@app.route("/analyze-event/<int:event_id>", methods=["POST"])
def analyze_single_event(event_id):
    try:
        event = fetch_suricata_event_by_id(event_id)
        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        # The preprocessing function expects a list of events
        features = preprocess_events([event])
        anomaly_result = detect_anomalies(features)

        # Update the event's status to analyzed
        update_event_analysis_status(event_id, True)

        EVENTS_PROCESSED.inc()
        is_anomaly = False
        if len(anomaly_result) > 0 and anomaly_result[0] == -1:
            is_anomaly = True
            ANOMALIES_DETECTED.inc()

        return make_response(jsonify({"event_id": event_id, "is_anomaly": is_anomaly}), 200)

    except Exception as e:
        logging.error(f"Error during single event analysis for event {event_id}: {e}")
        return make_response(jsonify({"error": "Failed to analyze event"}), 500)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        prediction = predict_real_time(data)
        return make_response(jsonify(prediction), 200)
    except Exception as e:
        logging.error(f"Error during real-time prediction: {e}")
        return make_response(jsonify({"error": "Failed to make real-time prediction"}), 500)

@app.route("/api-metrics", methods=["GET"])
def get_api_metrics():
    metrics = {
        "events_processed": EVENTS_PROCESSED._value.get(),
        "anomalies_detected": ANOMALIES_DETECTED._value.get()
    }
    return make_response(jsonify(metrics), 200)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
