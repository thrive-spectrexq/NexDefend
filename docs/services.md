# NexDefend Services

This document provides a detailed overview of the microservices that compose the NexDefend platform.

| Service | Language | Purpose |
| --- | --- | --- |
| `api` | Go | The main backend. Handles user auth, all CRUD operations, and API-to-AI proxying. |
| `frontend` | TypeScript | The React-based single-page application for all user interaction. |
| `ai` | Python | Handles all compute-heavy and specialized tasks: ML/AI, Nmap scanning, and UEBA. |
| `nexdefend-agent` | Go | Endpoint agent for collecting and streaming telemetry (FIM, process, network). |
| `nexdefend-soar` | Go | Listens for high-severity incidents on Kafka and runs automated response playbooks. |
| `nexdefend-cloud-connector` | Go | Ingests security logs and events from cloud providers. |
| `db` | N/A | PostgreSQL database for storing state (incidents, users, vulnerabilities, etc.). |
| `opensearch` | N/A | Searchable log store for all raw endpoint events. |
| `kafka`/`zookeeper` | N/A | The central event bus for decoupling services and handling high-throughput event data. |
| `suricata` | N/A | Network IDS. Shares its log volume with the `api` service for ingestion. |
| `prometheus`/`grafana` | N/A | Provides platform-level monitoring and metrics visualization. |
| `tip` | Go | Ingests threat intelligence feeds and correlates IOCs. |
| `correlation-engine` | Go | Links events and creates high-fidelity alerts. |
| `ndr` | Go | Ingests network data from sources like NetFlow, sFlow, Zeek, or Suricata. |
