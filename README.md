# NexDefend: AI-Powered Systems and Service Monitoring System

NexDefend is an industry-standard **AI-Powered Systems and Service Monitoring System** designed to bridge the gap between traditional monitoring and "Tier 1" enterprise platforms. It combines real-time metric collection, rule evaluation, and proactive threat detection with a cognitive intelligence layer.

The platform provides a unified "Single Pane of Glass" dashboard for visualizing the health, performance, and security posture of your infrastructure, capable of running in both a scalable Cloud mode and an offline "Battle Station" Desktop mode.

## Key Features

### 1. Cognitive Intelligence (GenAI & Predictive)
*   **"Sentinel" GenAI Copilot**: An integrated AI assistant (powered by Ollama or OpenAI) that allows operators to chat with their data. Ask questions like "Why did the CPU spike?" and get correlated answers.
*   **Predictive Resource Forecasting**: AI-driven trend analysis (Prophet/LSTM) to predict future resource usage (e.g., disk full warnings 24h in advance).

### 2. Deep Visibility (Interactive Visualization)
*   **Interactive Network Topology Map**: A dynamic, real-time graph visualization of your infrastructure and asset connections using ReactFlow.
*   **Cyber-Tactical Visuals**: A high-contrast dark theme with Glassmorphism UI, neon data visualization, and a global command bar for rapid navigation.
*   **Process Tree Forensics**: Visualizes parent-child process relationships to trace the root cause of security incidents.

### 3. Active Defense & Automation
*   **Monitoring Agent**: Lightweight Go agent for cross-platform (Linux, Windows, macOS) collection of metrics, logs, FIM, and network flows.
*   **Automated Response (SOAR)**: Trigger automated playbooks to remediate issues (e.g., block IP, restart service) based on alert logic.
*   **Active Scanning**: Integrated Nmap scanning for service discovery and vulnerability assessment.

### 4. Enterprise Experience (Desktop & Cloud)
*   **Cloud Mode**: Full microservices architecture (Go, Python, Kafka, OpenSearch) for scalable enterprise deployment.
*   **Desktop "Offline Battle Station"**: A standalone Wails-based application that runs entirely offline using local SQLite and embedded agents. Ideal for air-gapped environments or tactical analysis.
*   **Local Intelligence**: The Desktop app integrates with local Ollama instances to provide GenAI capabilities without data leaving the machine.

## Architecture

NexDefend operates as a distributed system of specialized microservices:

*   **Core API (Go)**: The central nervous system handling auth, data aggregation, and API proxying.
*   **Analytics Engine (Python)**: Handles heavy lifting for AI/ML, anomaly detection (`IsolationForest`), and LLM integration.
*   **Frontend (React/TypeScript)**: A high-density, professional monitoring console.
*   **Event Pipeline**: Kafka-based bus for high-throughput event processing and decoupling.
*   **Storage**: PostgreSQL for structured data and OpenSearch for massive log retention.

## Getting Started

### 1. Prerequisites

*   **Docker & Docker Compose** (for Cloud Mode)
*   **Go 1.21+** & **Node.js 18+** (for Desktop/Dev)
*   **Wails CLI**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
*   **Ollama**: Required for local "Sentinel" AI features. Install and pull a model (e.g., `ollama run mistral`).

### 2. Quick Start (Cloud Mode)

Run the full platform stack using Docker:

```bash
git clone https://github.com/thrive-spectrexq/NexDefend.git
cd NexDefend

# Create environment files (see docs/getting-started.md for templates)
cp .env.example .env
cp nexdefend-ai/.env.example nexdefend-ai/.env

# Start services
docker-compose up -d --build
```

Access the dashboard at **http://localhost:3000**.

### 3. Quick Start (Desktop Mode)

Run the standalone offline application with Embedded Architecture:

```bash
cd nexdefend-desktop
# Install frontend dependencies (if not already done)
cd ../nexdefend-frontend && npm install && cd ../nexdefend-desktop

# Run in Development Mode (Hot Reloading)
wails dev

# Build Final Binary
wails build
```

The compiled binary will be in `nexdefend-desktop/build/bin/`.

### 4. Access Points

*   **NexDefend Console**: `http://localhost:3000`
*   **Grafana**: `http://localhost:3001` (admin:grafana)
*   **Prometheus**: `http://localhost:9090`
*   **OpenSearch**: `http://localhost:9200`

## Documentation

*   [Getting Started Guide](docs/getting-started.md)
*   [Architecture Overview](docs/architecture.md)
*   [API Documentation](docs/api-documentation.md)

## License

This project is licensed under the GNU General Public License v3.0.
