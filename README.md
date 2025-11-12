# NexDefend: AI-Powered XDR Platform

NexDefend is a unified, cloud-native XDR (Extended Detection and Response) platform designed to protect organizations from evolving threats. It integrates endpoint monitoring, network security, AI-driven anomaly detection, and automated incident response into a single, cohesive system.

Built on a modern microservice architecture, NexDefend leverages Go for high-performance API services, Python for AI/ML analytics, Kafka for a resilient event pipeline, and OpenSearch for large-scale log storage and search.

## Key Features

The platform is a collection of specialized services working in concert.

### 1. Detection & Data Collection

*   **Endpoint Agent (nexdefend-agent)**: A lightweight Go agent that provides deep endpoint visibility. It streams security-relevant events to the Kafka pipeline.
    *   **Process Monitoring**: Captures process creation events, including PID, name, and command line arguments.
    *   **File Integrity Monitoring (FIM)**: Uses `fsnotify` to monitor critical files and directories (e.g., `/etc`) for unauthorized changes.
    *   **Network Connection Monitoring**: Tracks new network connections, linking them to specific processes.
*   **Network Intrusion Detection (Suricata)**: The platform is configured to run Suricata, a high-performance Network IDS, to monitor network traffic for known threats.
*   **Malware Hash Detection**: All file uploads are checked against a known malware hash registry stored in the database.

### 2. AI & Analytics (nexdefend-ai)

*   **ML Anomaly Detection**: Uses a pre-trained `IsolationForest` model to detect anomalies in Suricata event data. A dedicated `/train` endpoint allows for retraining the model.
*   **Automated Incident Creation**: The AI service automatically creates "Critical" or "High" severity incidents in the backend when anomalies are detected.
*   **Active Vulnerability Scanning**: Exposes a secure `/scan` endpoint that uses Nmap to perform on-demand port scanning, automatically creating vulnerability records for any open ports discovered.
*   **User & Entity Behavior Analytics (UEBA)**: A background worker consumes agent events from Kafka to perform simple behavioral analysis, such as flagging a process that starts from `/tmp` and immediately makes a network connection.

### 3. Response & Orchestration (nexdefend-soar)

*   **Automated SOAR Playbooks**: A Go-based SOAR (Security Orchestration, Automation, and Response) service consumes from the `incidents` Kafka topic.
*   **Incident-Driven Response**: When a "High" or "Critical" incident is detected, the SOAR service automatically triggers a playbook, such as initiating an Nmap scan on the incident's source IP.

### 4. Platform & UI (api & nexdefend-frontend)

*   **Full Incident Management**: A complete case management system for analysts to create, read, update, and resolve security incidents. Includes features for adding notes and changing status.
*   **Vulnerability Management**: A dedicated UI to view all discovered vulnerabilities, filter by status, and triage them from "Detected" to "Resolved".
*   **Secure Authentication**: Employs JWT-based authentication for the frontend, with separate public and private routes.
*   **Centralized Data Storage**:
    *   **PostgreSQL**: Serves as the primary database for structured, relational data (incidents, vulnerabilities, users, metrics, etc.).
    *   **OpenSearch**: Used as the high-throughput data store for all raw agent events (processes, FIM, net connections) ingested from Kafka.
*   **Observability**:
    *   **Prometheus**: Scrapes metrics from the Go API and Python AI service.
    *   **Grafana**: Provides pre-built dashboards for monitoring the AI service's performance (e.g., events processed, anomalies detected).

## Architecture

NexDefend operates as a distributed system of specialized microservices communicating via HTTP and a central Kafka event bus.

```mermaid
graph TD
    subgraph User & Endpoints
        direction TB
        F[Browser - React UI]
        A[nexdefend-agent]
    end

    subgraph Core Platform
        direction LR
        K[Kafka Bus]
        DB[(PostgreSQL DB)]
        OS[(OpenSearch)]
    end

    subgraph Services
        direction TB
        API[Go Core API]
        AI[Python AI Service]
        SOAR[Go SOAR Service]
        I[Go Ingestor]
        S[Suricata]
        G[Grafana]
        P[Prometheus]
    end

    %% UI -> Backend
    F -- HTTPS API --> API

    %% Agent -> Backend
    A -- Events --> K[Kafka - nexdefend-events]

    %% Ingestor -> Data Stores
    I -- Consumes --> K
    I -- Writes Agent Logs --> OS

    %% AI Service
    AI -- Consumes --> K
    AI -- Creates Incidents --> API
    AI -- Reads Events --> DB

    %% Core API
    API -- Reads/Writes --> DB
    API -- Produces --> K[Kafka - incidents]
    API -- Proxies Scan --> AI

    %% SOAR Service
    SOAR -- Consumes --> K[Kafka - incidents]
    SOAR -- Calls Scan --> AI

    %% Observability
    P -- Scrapes --> API
    P -- Scrapes --> AI
    G -- Reads --> P

    %% Suricata (File-based, as per docker-compose)
    S -- Writes --> LogVol(eve.json Volume)
    API -- Reads --> LogVol
```

### Service Overview

| Service           | Language   | Purpose                                                                                |
| ----------------- | ---------- | -------------------------------------------------------------------------------------- |
| `api`             | Go         | The main backend. Handles user auth, all CRUD operations, and API-to-AI proxying.        |
| `frontend`        | TypeScript | The React-based single-page application for all user interaction.                      |
| `ai`              | Python     | Handles all compute-heavy and specialized tasks: ML/AI, Nmap scanning, and UEBA.       |
| `nexdefend-agent` | Go         | Endpoint agent for collecting and streaming telemetry (FIM, process, network).         |
| `nexdefend-soar`  | Go         | Listens for high-severity incidents on Kafka and runs automated response playbooks.      |
| `db`              | N/A        | PostgreSQL database for storing state (incidents, users, vulnerabilities, etc.).       |
| `opensearch`      | N/A        | Searchable log store for all raw endpoint events.                                      |
| `kafka`/`zookeeper` | N/A        | The central event bus for decoupling services and handling high-throughput event data. |
| `suricata`        | N/A        | Network IDS. Shares its log volume with the `api` service for ingestion.                 |
| `prometheus`/`grafana` | N/A        | Provides platform-level monitoring and metrics visualization.                          |

## Getting Started

### 1. Prerequisites

*   Docker & Docker Compose
*   Git

### 2. Clone the Repository

```bash
git clone https://github.com/thrive-spectrexq/NexDefend.git
cd NexDefend
```

### 3. Create Environment Files

You must create two `.env` files.

#### `.env` (in the root directory)

```
# Database
DB_USER=nexdefend
DB_PASSWORD=password
DB_NAME=nexdefend_db
DB_HOST=localhost
DB_PORT=5432
DB_SSLMODE=disable

# Service Communication
API_PREFIX=/api/v1
PYTHON_API=http://localhost:5000
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Secrets (MUST change in production)
JWT_SECRET_KEY=my_super_secure_user_jwt_secret_key_123!@#
AI_SERVICE_TOKEN=my_secure_service_to_service_token_abc987

# Features
FIM_PATH=/etc
```

#### `nexdefend-ai/.env`

```
# Database
DB_NAME=nexdefend_db
DB_USER=nexdefend
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Service Communication
GO_API_URL=http://localhost:8080/api/v1
AI_SERVICE_TOKEN=my_secure_service_to_service_token_abc987
```

### 4. Run with Docker Compose

This is the recommended method to start all services.

```bash
docker-compose up -d --build
```

### 5. (Optional) Populate Sample Data

If the `suricata_events` table is empty, you may need to run a one-time script to populate it from the `sample_eve.json` for the AI model to have data.

### 6. Train the AI Model

After the services are running, you must train the initial AI model.

```bash
curl -X POST http://localhost:5000/train
```

### 7. Access the Application

*   **NexDefend UI**: `http://localhost:3000`
*   **Grafana**: `http://localhost:3001` (admin:grafana)
*   **Prometheus**: `http://localhost:9090`
*   **OpenSearch**: `http://localhost:9200`
*   **OpenSearch Dashboards**: `http://localhost:5601`

## License

This project is licensed under the GNU General Public License v3.0.
