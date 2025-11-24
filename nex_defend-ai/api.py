import logging
import os
from flask import Flask, jsonify, make_response, request
from flask_cors import CORS
from prometheus_client import Counter, make_wsgi_app, Gauge
from werkzeug.middleware.dispatcher import DispatcherMiddleware

from data_ingestion import (
    fetch_unprocessed_suricata_events,
    fetch_suricata_event_by_id,
    update_event_analysis_status,
    fetch_all_suricata_events,
)
from ml_anomaly_detection import (
    detect_anomalies,
    preprocess_events,
    predict_real_time,
    train_model,
)

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

@app.route("/train", methods=["POST"])
def train():
    try:
        events = fetch_all_suricata_events()
        features = preprocess_events(events, is_training=True)
        train_model(features)
        return make_response(jsonify({"message": "Model training successful"}), 200)
    except Exception as e:
        logging.error(f"Error during model training: {e}")
        return make_response(jsonify({"error": "Failed to train model"}), 500)

@app.route("/anomalies", methods=["GET"])
def get_batch_anomalies():
    try:
        events = fetch_unprocessed_suricata_events()
        features = preprocess_events(events)
        anomalies = detect_anomalies(features)
        return make_response(jsonify({"anomalies": anomalies.tolist()}), 200)
    except Exception as e:
        logging.error(f"Error during batch anomaly detection: {e}")
        return make_response(jsonify({"error": "Failed to detect batch anomalies"}), 500)

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
