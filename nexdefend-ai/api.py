import logging
from flask import Flask, jsonify, make_response
from flask_cors import CORS
from analysis import analyze_data
from data_ingestion import fetch_suricata_events
from ml_anomaly_detection import detect_anomalies, preprocess_events

app = Flask(__name__)

# Enable CORS for all origins
CORS(app)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

@app.route("/analysis", methods=["GET"])
def get_analysis():
    try:
        events = fetch_suricata_events()
        analysis = analyze_data(events)
        return make_response(jsonify(analysis), 200)
    except Exception as e:
        logging.error(f"Error during analysis: {e}")
        return make_response(jsonify({"error": "Failed to perform analysis"}), 500)

@app.route("/anomalies", methods=["GET"])
def get_anomalies():
    try:
        events = fetch_suricata_events()
        features = preprocess_events(events)
        anomalies = detect_anomalies(features)
        return make_response(jsonify({"anomalies": anomalies.tolist()}), 200)
    except Exception as e:
        logging.error(f"Error during anomaly detection: {e}")
        return make_response(jsonify({"error": "Failed to detect anomalies"}), 500)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
