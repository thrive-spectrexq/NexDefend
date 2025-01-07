import json

import numpy as np
from analysis import fetch_suricata_events
from sklearn.ensemble import IsolationForest


def preprocess_events(events):
    """Prepares event data for machine learning."""
    feature_matrix = []
    for event in events:
        # Hypothetical feature extraction: lengths of certain fields
        feature_matrix.append(
            [
                len(event.get("field1", "")),
                len(event.get("field2", "")),
                len(event.get("field3", "")),
            ]
        )
    return np.array(feature_matrix)


def detect_anomalies(features):
    """Detect anomalies using Isolation Forest."""
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    return model.predict(features)


if __name__ == "__main__":
    try:
        events = fetch_suricata_events()
        features = preprocess_events(events)
        anomalies = detect_anomalies(features)
        print(json.dumps({"anomalies": anomalies.tolist()}, indent=2))
    except Exception as e:
        print(f"Error during anomaly detection: {e}")
