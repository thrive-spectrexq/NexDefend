# NexDefend

**NexDefend** is designed to provide real-time system and monitoring, AI-powered threat detection, alerts and automated incident response management that traces from Osquery and Suricata, stores and displays the results with dashboards.

## Prerequisites

- Before setting up NexDefend, ensure the following are installed on your system:

- [Osquery](https://osquery.io/downloads/official/5.14.1)
- [Suricata](https://suricata.io/download/)
- [PostgreSQL](https://www.postgresql.org/download/)

## Setup Instructions

### Option 1: Running with Docker Compose

1. Clone the repository:

    ```bash
    git clone https://github.com/thrive-spectrexq/NexDefend.git
    ```

    ```bash
    cd NexDefend
    ```

2. Run the following command to build and start the services:

    ```bash
    docker-compose up --build
    ```

### Option 2: Running on Windows (via PowerShell)

1. Run the `nexdefend_setup.ps1` script:

    ```powershell
    .\nexdefend_setup.ps1 initdb
    ```

    ```powershell
    .\nexdefend_setup.ps1 start
    ```

### Option 3: Running on Linux/macOS

1. Run the `nexdefend_setup.sh` script:

    ```bash
    chmod +x nexdefend_setup.sh
    ```

    ```bash
    ./nexdefend_setup.sh initdb
    ```

    ```bash
    ./nexdefend_setup.sh start
    ```

2. Optional, run `nexdefend_setup.sh docker` script:

    ```bash
    ./nexdefend_setup.sh docker
    ```

### Option 4: Running Manually

1. Download the Go module dependencies:

    ```bash
    go mod tidy
    ```

2. Run the application:

    ```bash
    go run main.go
    ```

3. Open a new terminal and navigate to the frontend directory:

    ```bash
    cd nexdefend-frontend
    ```

4. Install the frontend dependencies:

    ```bash
    npm install
    ```

5. Start the frontend application:

    ```bash
    npm start
    ```

### In Development

- NexDefend Real-Time System Monitoring and Threat Detection

---

### LICENSE

- This project is licensed under the [GPL-3.0 license](LICENSE)
