# Getting Started

This guide provides step-by-step instructions on how to set up and run the NexDefend platform locally.

### 1. Prerequisites

*   Docker & Docker Compose (for Cloud Mode)
*   Go 1.21+ & Node.js 18+ (for Desktop Mode)
*   Wails CLI (for Desktop Mode): `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
*   Git

### 2. Clone the Repository

```bash
git clone https://github.com/thrive-spectrexq/NexDefend.git
cd NexDefend
```

### 3. Create Environment Files (Cloud Mode)

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

### 4. Run with Docker Compose (Cloud Mode)

This is the recommended method to start all services.

```bash
docker-compose up -d --build
```

### 5. Run Desktop Application (Desktop Mode)

For offline or standalone usage:

1.  **Configure Wails**: Ensure `nexdefend-desktop/wails.json` points to `../nexdefend-frontend`.
2.  **Install Frontend Deps**:
    ```bash
    cd nexdefend-frontend
    npm install
    cd ../nexdefend-desktop
    ```
3.  **Run Dev Mode**:
    ```bash
    wails dev
    ```
4.  **Build Binary**:
    ```bash
    wails build
    ```
    The output binary will be in `nexdefend-desktop/build/bin/`.

### 6. Train the AI Model (Cloud Mode)

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
