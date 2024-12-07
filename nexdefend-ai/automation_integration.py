from analysis import analyze_data
from data_ingestion import fetch_suricata_events
from ml_anomaly_detection import detect_anomalies, preprocess_events


def respond_to_anomalies(events, anomaly_flags):
    """Automates actions based on detected anomalies."""
    for idx, anomaly in enumerate(anomaly_flags):
        if anomaly == -1:  # Anomalous event
            event = events[idx]
            print(f"Anomalous Event Detected: {event}")


if __name__ == "__main__":
    events = fetch_suricata_events()
    features = preprocess_events(events)
    anomaly_flags = detect_anomalies(features)
    respond_to_anomalies(events, anomaly_flags)
