# NexDefend

**NexDefend** is designed to provide real-time system monitoring, AI-powered threat detection, alerts and automated incident response management that traces from Suricata logs, stores, analyzes and displays the results with dashboards.

## Architecture

```mermaid
graph TD;
    A[Suricata IDS/IPS] --> B[Go Data Ingestion];
    B --> C[Python Analysis];
    C --> D[Machine Learning & Anomaly Detection];
    A -->|Real-time Traffic| B;
    B -->|High-performance Data Pipelines| C;
    C -->|Analyzes Data| D;
    E[PostgreSQL Data Storage] --> F[Python Automation & Integration];
    F --> G[Dashboards & Visualization];
    G --> H[Alerts & Threats];
    H --> I[Real-time Alerts];
    H --> J[Threat Reports];
    H --> L[Incident Response];
    H --> K[Notifications];
    D -->|Stores Data| E;
    F -->|Integrates Data| G;
```

## Prerequisites

- Before setting up NexDefend, ensure the following are installed on your system:

- [Suricata](https://suricata.io/download/)
- [PostgreSQL](https://www.postgresql.org/download/)

## Setup Instructions

### To install

1. Clone the repository:

    ```bash
    git clone https://github.com/thrive-spectrexq/NexDefend.git
    ```

    ```bash
    cd NexDefend
    ```

### Option 1: Running on Windows (via PowerShell)

1. Run the `nexdefend_setup.ps1` script:

    ```powershell
    .\nexdefend_setup.ps1 start
    ```

### Option 2: Running on Linux/macOS

1. Run the `nexdefend_setup.sh` script:

    ```bash
    chmod +x nexdefend_setup.sh
    ```

    ```bash
    ./nexdefend_setup.sh
    ```

2. Optional, run `nexdefend_setup.sh docker` script:

    ```bash
    ./nexdefend_setup.sh docker
    ```

### Option 3: Running Manually

1. Install python packages:

    ```bash
    pip install -r nexdefend-ai/requirements.txt
    ```

2. Run the application:

    ```bash
    python nexdefend-ai/api.py
    ```

3. Open a new terminal and run:

    ```bash
    go mod tidy
    ```

4. Run the application:

    ```bash
    go run main.go
    ```

5. Open a new terminal and navigate to the frontend directory:

    ```bash
    cd nexdefend-frontend
    ```

6. Install the frontend dependencies:

    ```bash
    npm install
    ```

7. Start the frontend application:

    ```bash
    npm start
    ```

### In Development

- NexDefend Real-Time System Monitoring and Threat Detection

---

### LICENSE

- This project is licensed under the [GPL-3.0 license](LICENSE)
