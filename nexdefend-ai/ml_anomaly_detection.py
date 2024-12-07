import json

import numpy as np
from analysis import fetch_suricata_events
from sklearn.ensemble import IsolationForest


def preprocess_events(events):
    """Prepares event data for machine learning."""
    feature_matrix = []
    for event in events:
        feature_matrix.append(
            [len(event[3]), len(event[4]), len(event[5])]
        )  # Hypothetical feature extraction
    return np.array(feature_matrix)


def detect_anomalies(features):
    """Detect anomalies using Isolation Forest."""
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    return model.predict(features)


if __name__ == "__main__":
    events = fetch_suricata_events()
    features = preprocess_events(events)
    anomalies = detect_anomalies(features)
    print(json.dumps({"anomalies": anomalies.tolist()}, indent=2))
