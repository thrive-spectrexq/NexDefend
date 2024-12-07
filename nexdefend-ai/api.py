from analysis import analyze_data
from data_ingestion import fetch_suricata_events
from flask import Flask, jsonify
from ml_anomaly_detection import detect_anomalies, preprocess_events

app = Flask(__name__)


@app.route("/analysis", methods=["GET"])
def get_analysis():
    events = fetch_suricata_events()
    analysis = analyze_data(events)
    return jsonify(analysis)


@app.route("/anomalies", methods=["GET"])
def get_anomalies():
    events = fetch_suricata_events()
    features = preprocess_events(events)
    anomalies = detect_anomalies(features)
    return jsonify({"anomalies": anomalies.tolist()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
