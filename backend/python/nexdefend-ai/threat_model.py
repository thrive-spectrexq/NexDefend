import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Simulate a dataset with some labeled threat data
X_train = np.array([[0.1, 0.2, 0.3], [0.3, 0.2, 0.1], [0.5, 0.6, 0.7], [0.6, 0.5, 0.4]])
y_train = np.array([0, 0, 1, 1])  # 0: No threat, 1: Threat detected

# Train the model
model = RandomForestClassifier()
model.fit(X_train, y_train)


# Function to use the model for prediction
def detect_threat(features):
    prediction = model.predict([features])
    return bool(prediction[0])
