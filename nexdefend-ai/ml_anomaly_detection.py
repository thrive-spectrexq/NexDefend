import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder

def preprocess_events(events):
    """Prepares event data for machine learning."""
    if not events:
        return np.array([])

    # Convert list of tuples to a list of dictionaries
    column_names = ['id', 'timestamp', 'event_type', 'http', 'tls', 'dns', 'alert', 'is_analyzed']
    event_dicts = [dict(zip(column_names, event)) for event in events]

    # Create a DataFrame
    df = pd.DataFrame(event_dicts)

    # Feature Engineering
    features = []
    for index, row in df.iterrows():
        feature_dict = {}

        # Event type
        feature_dict['event_type'] = row['event_type']

        # HTTP features
        http_data = row['http'] if row['http'] else {}
        feature_dict['http_length'] = http_data.get('length', 0)
        feature_dict['http_status'] = http_data.get('status', 0)

        # Alert features
        alert_data = row['alert'] if row['alert'] else {}
        feature_dict['alert_signature_id'] = alert_data.get('signature_id', 0)

        features.append(feature_dict)

    feature_df = pd.DataFrame(features)

    # One-hot encode categorical features
    categorical_cols = ['event_type']
    encoder = OneHotEncoder(handle_unknown='ignore')
    encoded_cats = encoder.fit_transform(feature_df[categorical_cols])

    # Combine numerical and encoded categorical features
    numerical_cols = ['http_length', 'http_status', 'alert_signature_id']
    numerical_features = feature_df[numerical_cols].values

    if encoded_cats.shape[0] > 0:
        feature_matrix = np.hstack([numerical_features, encoded_cats.toarray()])
    else:
        feature_matrix = numerical_features

    return feature_matrix

def detect_anomalies(features):
    """Detect anomalies using Isolation Forest."""
    if features.shape[0] == 0:
        return np.array([])

    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    return model.predict(features)

def predict_real_time(data):
    # This is a placeholder for a real-time prediction model
    # For now, let's assume it returns a prediction for a single data point
    return {"prediction": "normal"}

if __name__ == "__main__":
    # This part is for standalone testing and will need to be adapted
    # as it depends on data_ingestion.py which is also being changed.
    print("This script is not meant to be run standalone anymore without a proper data source.")
    # from data_ingestion import fetch_suricata_events
    # try:
    #     events = fetch_suricata_events()
    #     features = preprocess_events(events)
    #     anomalies = detect_anomalies(features)
    #     print(json.dumps({"anomalies": anomalies.tolist()}, indent=2))
    # except Exception as e:
    #     print(f"Error during anomaly detection: {e}")
