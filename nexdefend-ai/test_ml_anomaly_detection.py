import os
import joblib
import numpy as np
import pytest
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import OneHotEncoder

# Mock the EVENT_COLUMNS from data_ingestion
from ml_anomaly_detection import (
    preprocess_events,
    train_model,
    detect_anomalies,
    score_anomalies,
    predict_real_time,
    MODEL_PATH,
    ENCODER_PATH
)

# Mock EVENT_COLUMNS directly in the test file
EVENT_COLUMNS = [
    'id', 'timestamp', 'event_type', 'src_ip', 'dest_ip', 'dest_port',
    'http', 'flow', 'dns', 'alert', 'is_anomaly'
]

@pytest.fixture(autouse=True)
def cleanup_files():
    """Fixture to clean up model and encoder files before and after tests."""
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    if os.path.exists(ENCODER_PATH):
        os.remove(ENCODER_PATH)
    yield
    if os.path.exists(MODEL_PATH):
        os.remove(MODEL_PATH)
    if os.path.exists(ENCODER_PATH):
        os.remove(ENCODER_PATH)

@pytest.fixture
def sample_events():
    """Provides a list of sample events for testing."""
    return [
        (1, '2023-01-01T12:00:00', 'http', '192.168.1.1', '10.0.0.1', 80, {'http_method': 'GET', 'length': 100, 'status': 200}, None, None, None, False),
        (2, '2023-01-01T12:01:00', 'dns', '192.168.1.2', '8.8.8.8', 53, None, None, {'rrname': 'example.com'}, None, False),
        (3, '2023-01-01T12:02:00', 'alert', '192.168.1.3', '10.0.0.2', 1234, None, None, None, {'severity': 1, 'signature_id': 123}, False),
        # An anomalous event
        (4, '2023-01-01T12:03:00', 'http', '192.168.1.1', '10.0.0.1', 8080, {'http_method': 'POST', 'length': 99999, 'status': 404}, None, None, None, False),
    ]

@pytest.fixture
def trained_model(sample_events):
    """Fixture to provide a pre-trained model and encoder."""
    features = preprocess_events(sample_events, is_training=True)
    train_model(features)
    return joblib.load(MODEL_PATH), joblib.load(ENCODER_PATH)

def test_preprocess_events_training(sample_events):
    """Test the preprocessing function in training mode."""
    features = preprocess_events(sample_events, is_training=True)

    assert isinstance(features, np.ndarray)
    assert features.shape[0] == len(sample_events)
    # The number of columns will be the number of numerical features + the number of one-hot encoded categories
    # This can be dynamic, so we check that it's greater than the number of numerical columns
    assert features.shape[1] > 6
    assert os.path.exists(ENCODER_PATH), "Encoder should be saved during training"

def test_preprocess_events_inference(trained_model, sample_events):
    """Test the preprocessing function in inference mode."""
    _, encoder = trained_model
    features = preprocess_events(sample_events, is_training=False)

    expected_cols = 6 + len(encoder.get_feature_names_out(['event_type', 'http_method']))

    assert isinstance(features, np.ndarray)
    assert features.shape[0] == len(sample_events)
    assert features.shape[1] == expected_cols

def test_preprocess_events_empty_input():
    """Test preprocessing with an empty list of events."""
    features = preprocess_events([], is_training=True)
    assert isinstance(features, np.ndarray)
    assert features.shape[0] == 0

def test_preprocess_events_missing_data():
    """Test preprocessing with events that have missing or None fields."""
    events_with_missing = [
        (1, '2023-01-01T12:00:00', 'http', '192.168.1.1', '10.0.0.1', None, None, None, None, None, False),
        (2, '2023-01-01T12:01:00', 'dns', '192.168.1.2', '8.8.8.8', 53, {}, None, {}, None, False),
    ]
    features = preprocess_events(events_with_missing, is_training=True)

    # Check that it doesn't crash and returns a valid feature matrix
    assert isinstance(features, np.ndarray)
    assert features.shape[0] == len(events_with_missing)
    # Check that there are no NaNs in the output
    assert not np.isnan(features).any()


def test_detect_anomalies(trained_model, sample_events):
    """Test the anomaly detection function."""
    model, _ = trained_model
    features = preprocess_events(sample_events, is_training=False)

    # The model should predict the 4th event as an anomaly (-1) and others as normal (1)
    # Note: IsolationForest results can vary, this is an idealized expectation.
    # A more robust test checks for the presence of anomalies, not their exact count.
    predictions = detect_anomalies(features)

    assert isinstance(predictions, np.ndarray)
    assert len(predictions) == len(sample_events)
    assert -1 in predictions, "The model should have detected at least one anomaly"

def test_score_anomalies(trained_model, sample_events):
    """Test the anomaly scoring function."""
    model, _ = trained_model
    features = preprocess_events(sample_events, is_training=False)

    scores = score_anomalies(features)

    assert isinstance(scores, np.ndarray)
    assert len(scores) == len(sample_events)
    # Anomaly scores are lower for anomalies. The anomalous event should have a lower score.
    assert scores[3] < scores[0], "The anomalous event's score should be lower than a normal event's score"
    assert scores[3] < scores[1]
    assert scores[3] < scores[2]

def test_predict_real_time(trained_model):
    """Test the real-time prediction for a single event."""
    # A clearly anomalous event
    anomalous_event = (5, '2023-01-01T12:04:00', 'http', '192.168.1.1', '10.0.0.1', 80, {'http_method': 'GET', 'length': 100000, 'status': 500}, None, None, None, False)

    prediction = predict_real_time(anomalous_event)

    assert isinstance(prediction, list)
    assert prediction == [-1], "The anomalous event should be classified as an anomaly (-1)"

    # A clearly normal event
    normal_event = (6, '2023-01-01T12:05:00', 'dns', '192.168.1.10', '8.8.4.4', 53, None, None, {'rrname': 'google.com'}, None, False)

    prediction = predict_real_time(normal_event)

    assert prediction == [1], "The normal event should be classified as normal (1)"

def test_detect_anomalies_no_model(sample_events):
    """Test that detect_anomalies trains a new model if one doesn't exist."""
    assert not os.path.exists(MODEL_PATH)

    features = preprocess_events(sample_events, is_training=True) # Use is_training to create encoder
    detect_anomalies(features)

    assert os.path.exists(MODEL_PATH), "The function should have created a new model file"

def test_detect_anomalies_empty_input():
    """Test detect_anomalies with empty input."""
    result = detect_anomalies(np.array([]).reshape(0, 2)) # Shape with some columns
    assert isinstance(result, np.ndarray)
    assert len(result) == 0

def test_score_anomalies_empty_input():
    """Test score_anomalies with empty input."""
    result = score_anomalies(np.array([]).reshape(0, 2))
    assert isinstance(result, np.ndarray)
    assert len(result) == 0
