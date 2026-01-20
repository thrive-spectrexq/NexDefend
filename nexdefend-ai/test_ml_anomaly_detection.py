import unittest
import numpy as np
from ml_anomaly_detection import preprocess_events, train_model, detect_anomalies

class TestMlAnomalyDetection(unittest.TestCase):

    def test_preprocess_events(self):
        events = [
            (1, '2025-11-11T12:00:00', 'http', '192.168.1.1', '10.0.0.1', 80, {'length': 100, 'status': 200}, None, None, None, False),
            (2, '2025-11-11T12:01:00', 'dns', '192.168.1.2', '8.8.8.8', 53, None, None, {'rrname': 'example.com'}, None, False),
        ]
        features = preprocess_events(events, is_training=True)
        self.assertEqual(features.shape, (2, 11))

    def test_train_and_detect(self):
        events = [
            (1, '2025-11-11T12:00:00', 'http', '192.168.1.1', '10.0.0.1', 80, {'length': 100, 'status': 200}, None, None, None, False),
            (2, '2025-11-11T12:01:00', 'http', '192.168.1.1', '10.0.0.1', 80, {'length': 10000, 'status': 404}, None, None, None, False),
        ]
        features = preprocess_events(events, is_training=True)
        train_model(features)
        anomalies = detect_anomalies(features)
        self.assertEqual(len(anomalies), 2)

if __name__ == '__main__':
    unittest.main()
