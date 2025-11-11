import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder

MODEL_PATH = "isolation_forest_model.joblib"
ENCODER_PATH = "one_hot_encoder.joblib"

def train_model(features):
    """Trains the Isolation Forest model and saves it."""
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    joblib.dump(model, MODEL_PATH)

def preprocess_events(events, is_training=False):
    """Prepares event data for machine learning."""
    if not events:
        return np.array([])

    column_names = ['id', 'timestamp', 'event_type', 'src_ip', 'dest_ip', 'dest_port', 'http', 'tls', 'dns', 'alert', 'is_analyzed']
    event_dicts = [dict(zip(column_names, event)) for event in events]
    df = pd.DataFrame(event_dicts)

    features = []
    for index, row in df.iterrows():
        http_data = row.get('http') or {}
        alert_data = row.get('alert') or {}
        feature_dict = {
            'event_type': row['event_type'],
            'http_length': http_data.get('length', 0),
            'http_status': http_data.get('status', 0),
            'alert_signature_id': alert_data.get('signature_id', 0),
        }
        features.append(feature_dict)

    feature_df = pd.DataFrame(features)
    categorical_cols = ['event_type']
    numerical_cols = ['http_length', 'http_status', 'alert_signature_id']

    if is_training:
        encoder = OneHotEncoder(handle_unknown='ignore')
        encoded_cats = encoder.fit_transform(feature_df[categorical_cols])
        joblib.dump(encoder, ENCODER_PATH)
    else:
        encoder = joblib.load(ENCODER_PATH)
        encoded_cats = encoder.transform(feature_df[categorical_cols])

    numerical_features = feature_df[numerical_cols].values
    if encoded_cats.shape[0] > 0:
        feature_matrix = np.hstack([numerical_features, encoded_cats.toarray()])
    else:
        feature_matrix = numerical_features

    return feature_matrix

def detect_anomalies(features):
    """Detect anomalies using the pre-trained Isolation Forest model."""
    if features.shape[0] == 0:
        return np.array([])
    model = joblib.load(MODEL_PATH)
    return model.predict(features)

def predict_real_time(data):
    """Predicts if a single event is an anomaly."""
    features = preprocess_events([data])
    return detect_anomalies(features).tolist()

if __name__ == "__main__":
    # Example training workflow (replace with actual data loading)
    # from data_ingestion import fetch_all_suricata_events
    # events = fetch_all_suricata_events()
    # features = preprocess_events(events, is_training=True)
    # train_model(features)
    print("Model training complete. Run api.py to use the model.")
