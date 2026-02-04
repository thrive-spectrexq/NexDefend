# Deployment Guide

This guide describes how to deploy NexDefend in a production environment.

## Prerequisites

- **Docker** and **Docker Compose**
- **Git**
- **PostgreSQL** (Managed or Containerized)
- **Kafka** (Managed or Containerized)
- **OpenSearch** (Managed or Containerized)

## Architecture

NexDefend consists of several microservices that can be deployed independently or as a monolithic container:

1.  **Core API (Go)**: Handles business logic, auth, and database interactions.
2.  **AI Service (Python)**: Provides anomaly detection, LLM integration, and forecasting.
3.  **SOAR Engine (Go)**: Executes automated remediation playbooks.
4.  **Forensics Worker (Python)**: Processes uploaded evidence (memory dumps, binaries).

## Docker Compose Deployment

We provide a `docker-compose.prod.yml` that orchestrates the entire stack including dependencies.

### 1. Configure Environment

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env` and set secure values for:
- `JWT_SECRET_KEY`
- `AI_SERVICE_TOKEN`
- `DB_PASSWORD`
- `POSTGRES_PASSWORD`

### 2. Build the Images

The `docker-compose.prod.yml` uses the `nexdefend/core:v1.0.0` image. You should build this image from the source to include the latest security hardenings.

```bash
docker build -t nexdefend/core:v1.0.0 .
```

### 3. Start the Stack

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This will start:
- `postgres` on port 5432
- `kafka` on port 9092
- `opensearch` on port 9200
- `api` on port 8080
- `ai` on port 5000
- `soar` (background worker)
- `ui` on port 80

### 4. Verify Deployment

Check the health endpoints:

```bash
curl http://localhost:8080/health
curl http://localhost:5000/health
```

## Production Security Checklist

- [ ] **Secrets**: Ensure no secrets are hardcoded. Use a secrets manager (Vault, AWS Secrets Manager) and inject them as environment variables.
- [ ] **TLS**: Place a reverse proxy (Nginx, Traefik, AWS ALB) in front of the `ui` and `api` containers to terminate TLS (HTTPS).
- [ ] **Network**: Restrict access to ports 5432 (DB), 9092 (Kafka), and 9200 (OpenSearch) to internal networks only.
- [ ] **AI Model**: If using the internal LLM, ensure the host has sufficient resources or configure `OLLAMA_HOST` to point to a dedicated inference server.
- [ ] **Forensics**: The forensics worker runs analysis tools. For high security, deploy this worker in an isolated sandbox or VM with strict resource limits.

## Kubernetes

A Helm chart is provided in `nexdefend-chart/`.

1.  Update `values.yaml` with your image repository and tag.
2.  Install the chart:

```bash
helm install nexdefend ./nexdefend-chart --namespace nexdefend --create-namespace
```
