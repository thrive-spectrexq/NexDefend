import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder
from data_ingestion import EVENT_COLUMNS # Import the column list

MODEL_PATH = "isolation_forest_model.joblib"
ENCODER_PATH = "one_hot_encoder.joblib"

def train_model(features):
    """Trains the Isolation Forest model and saves it."""
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(features)
    joblib.dump(model, MODEL_PATH)

def preprocess_events(events, is_training=False):
    """Prepares event data for machine learning with enhanced features."""
    if not events:
        # Return empty array with correct shape if possible
        try:
            encoder = joblib.load(ENCODER_PATH)
            n_categorical_features = encoder.categories_[0].shape[0]
        except FileNotFoundError:
            n_categorical_features = 1 # Fallback
        
        # Adjust numeric feature count to match new features
        n_numeric_features = 6 
        return np.empty((0, n_numeric_features + n_categorical_features))

    # Use the imported column names
    event_dicts = [dict(zip(EVENT_COLUMNS, event)) for event in events]
    df = pd.DataFrame(event_dicts)

    features = []
    for index, row in df.iterrows():
        http_data = row.get('http') or {}
        alert_data = row.get('alert') or {}
        dns_data = row.get('dns') or {}

        feature_dict = {
            'event_type': row.get('event_type', 'unknown'),
            'dest_port': row.get('dest_port', 0),
            'http_length': http_data.get('length', 0),
            'http_status': http_data.get('status', 0),
            'http_method': http_data.get('http_method', 'NONE'),
            'alert_signature_id': alert_data.get('signature_id', 0),
            'alert_severity': alert_data.get('severity', 0),
            'dns_query_length': len(str(dns_data.get('rrname', ''))),
        }
        features.append(feature_dict)

    feature_df = pd.DataFrame(features)
    
    # Define new categorical and numerical columns
    categorical_cols = ['event_type', 'http_method']
    numerical_cols = [
        'dest_port', 'http_length', 'http_status', 
        'alert_signature_id', 'alert_severity', 'dns_query_length'
    ]

    # Handle missing values (fill with 0 or 'unknown')
    feature_df[numerical_cols] = feature_df[numerical_cols].fillna(0)
    feature_df[categorical_cols] = feature_df[categorical_cols].fillna('unknown')

    if is_training:
        encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        encoded_cats = encoder.fit_transform(feature_df[categorical_cols])
        joblib.dump(encoder, ENCODER_PATH)
    else:
        try:
            encoder = joblib.load(ENCODER_PATH)
            encoded_cats = encoder.transform(feature_df[categorical_cols])
        except FileNotFoundError:
            # Fallback if model is not trained: create dummy encoder
            print("Warning: Encoder file not found. Fitting a temporary encoder.")
            encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
            encoded_cats = encoder.fit_transform(feature_df[categorical_cols])
            joblib.dump(encoder, ENCODER_PATH)


    numerical_features = feature_df[numerical_cols].values
    
    if encoded_cats.shape[0] > 0:
        feature_matrix = np.hstack([numerical_features, encoded_cats])
    else:
        # Handle case with no data
        feature_matrix = numerical_features

    return feature_matrix

def detect_anomalies(features):
    """Detect anomalies using the pre-trained Isolation Forest model."""
    if features.shape[0] == 0:
        return np.array([])
    try:
        model = joblib.load(MODEL_PATH)
    except FileNotFoundError:
        print("Warning: Model file not found. Training a new model.")
        # Train a dummy model to avoid crashing
        train_model(features)
        model = joblib.load(MODEL_PATH)
        
    return model.predict(features)

def predict_real_time(data):
    """Predicts if a single event is an anomaly."""
    # Ensure data is wrapped in a list for preprocess_events
    features = preprocess_events([data], is_training=False)
    return detect_anomalies(features).tolist()

def score_anomalies(features):
    """Scores anomalies using the pre-trained Isolation Forest model."""
    if features.shape[0] == 0:
        return np.array([])
    try:
        model = joblib.load(MODEL_PATH)
    except FileNotFoundError:
        print("Warning: Model file not found. Training a new model.")
        # Train a dummy model to avoid crashing
        train_model(features)
        model = joblib.load(MODEL_PATH)

    return model.score_samples(features)

if __name__ == "__main__":
    # Example training workflow (replace with actual data loading)
    from data_ingestion import fetch_all_suricata_events
    print("Fetching all events for training...")
    events = fetch_all_suricata_events()
    if events:
        print(f"Fetched {len(events)} events.")
        features = preprocess_events(events, is_training=True)
        print(f"Preprocessing complete. Feature matrix shape: {features.shape}")
        train_model(features)
        print("Model training complete. Model and encoder saved.")
        print("Run api.py to use the model.")
    else:
        print("No events found in database to train on.")
