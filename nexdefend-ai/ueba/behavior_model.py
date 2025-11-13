
import json

class BehaviorModel:
    def __init__(self, user):
        self.user = user
        self.baseline = {}

    def baseline(self, events):
        """Creates a baseline of normal behavior for the user."""
        for event in events:
            event_type = event.get("event_type")
            if event_type not in self.baseline:
                self.baseline[event_type] = 0
            self.baseline[event_type] += 1

    def detect_anomalies(self, event):
        """Detects anomalies in the user's behavior."""
        event_type = event.get("event_type")
        if event_type not in self.baseline:
            return True
        return False
