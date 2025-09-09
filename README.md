# NexDefend

**NexDefend** is a security platform that provides real-time system monitoring, AI-powered threat detection, and automated incident response. It ingests Suricata logs, analyzes them for threats, and presents the findings through intuitive dashboards.

## Features

- **Real-time Threat Detection**: Ingests and analyzes Suricata logs in real-time.
- **AI-Powered Analysis**: Utilizes machine learning models to detect anomalies and potential threats.
- **Incident Response**: Automated incident reporting and management.
- **Dashboards & Visualization**: Rich dashboards for visualizing security events and system metrics using Grafana.
- **Vulnerability Scanning**: Integrated tools for scanning and managing vulnerabilities.
- **Compliance Reporting**: Generates compliance reports based on system activity.

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

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Suricata](https://suricata.io/download/)
- [Go](https://golang.org/doc/install) (for manual setup)
- [Node.js](https://nodejs.org/en/download/) (for manual setup)
- [PostgreSQL](https://www.postgresql.org/download/) (for manual setup)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/thrive-spectrexq/NexDefend.git
cd NexDefend
```

### 2. Recommended Setup: Docker

This is the easiest and recommended way to get NexDefend running. It uses Docker Compose to start all the required services.

```bash
docker-compose up -d
```

This will start the following services:
- `api`: The Go backend (port 8080)
- `ai`: The Python AI service (port 5000)
- `frontend`: The React frontend (port 3000)
- `db`: The PostgreSQL database (port 5432)
- `prometheus`: The Prometheus server (port 9090)
- `grafana`: The Grafana server (port 3001)

### 3. Scripted Setup

These scripts automate the setup process.

#### On Linux/macOS

To run the application with services running as background processes on your host:
```bash
chmod +x nexdefend_setup.sh
./nexdefend_setup.sh
```

To run the application using Docker (equivalent to `docker-compose up -d`):
```bash
chmod +x nexdefend_setup.sh
./nexdefend_setup.sh docker
```

#### On Windows (via PowerShell)

```powershell
.\nexdefend_setup.ps1 start
```

### 4. Manual Setup

If you prefer to run each component manually:

#### Backend (Go)
```bash
go mod tidy
go run main.go
```

#### AI Service (Python)
```bash
cd nexdefend-ai && \
python3 -m venv venv && \
. venv/bin/activate && \
pip install --upgrade pip && \
pip install -r requirements.txt
```

```bash
cd nexdefend-ai && . venv/bin/activate && python api.py
```

#### Frontend (React)
```bash
cd nexdefend-frontend
npm install
npm start
```

You will also need to have a PostgreSQL database running and configure the services to connect to it. See `docker-compose.yml` for the required environment variables.

## Usage

- **Web Application**: Access the NexDefend frontend at `http://localhost:3000`.
- **Grafana Dashboards**: Access Grafana at `http://localhost:3001`.
  - **Username**: admin
  - **Password**: grafana

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

---

### LICENSE

- This project is licensed under the [GPL-3.0 license](LICENSE)
