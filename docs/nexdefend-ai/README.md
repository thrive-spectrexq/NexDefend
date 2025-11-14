# NexDefend AI

The NexDefend AI service is responsible for all compute-heavy and specialized tasks, including machine learning, AI, Nmap scanning, and User and Entity Behavior Analytics (UEBA).

## Features

-   **ML Anomaly Detection**: Uses a pre-trained `IsolationForest` model to detect anomalies in Suricata event data. A dedicated `/train` endpoint allows for retraining the model.
-   **Automated Incident Creation**: The AI service automatically creates "Critical" or "High" severity incidents in the backend when anomalies are detected.
-   **Active Vulnerability Scanning**: Exposes a secure `/scan` endpoint that uses Nmap to perform on-demand port scanning, automatically creating vulnerability records for any open ports discovered.
-   **User & Entity Behavior Analytics (UEBA)**: A background worker consumes agent events from Kafka to perform behavioral analysis and detect anomalies.
