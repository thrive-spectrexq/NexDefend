# Next Generation Threats Detection Platform

**NexDefend** is a cutting-edge cybersecurity platform designed to provide real-time monitoring, AI-powered threat detection, and automated incident response. With a focus on protecting systems from emerging cyber threats, NexDefend offers robust security features and comprehensive insights for proactive defense.

## Key Features

- AI-driven threat detection and analysis
- Real-time system monitoring and alerts
- Automated vulnerability assessments
- Incident management and response
- Compliance and security auditing

### Prerequisites

Before setting up NexDefend, ensure the following are installed on your system:

- **Go** (1.22+)
- **Python** (3.11+)
- **Node.js** (20+)
- **npm** (10+)
- **PostgreSQL** (16+)
- **Docker**

### Setup Instructions

### Option 1: Running with Docker Compose

1. Clone the repository:

    ```bash
    git clone https://github.com/thrive-spectrexq/NexDefend.git
    ```

    ```bash
    cd NexDefend
    ```

2. Ensure Docker and Docker Compose are installed.

3. Run the following command to build and start the services:

    ```bash
    docker-compose up --build
    ```

### Option 2: Running on Windows (via PowerShell)

1. Run the `nexdefend_setup.ps1` script:

    ```powershell
    .\nexdefend_setup.ps1
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
    ./nexdefend_setup.sh
    ```

    ```bash
    ./nexdefend_setup.sh start
    ```

2. Optional, run `nexdefend_setup.sh docker` script:

    ```bash
    ./nexdefend_setup.sh docker
    ```

### In Development
NexDefend aims to simplify and enhance cybersecurity operations through advanced automation and AI, making it easier for organizations to stay ahead of cyber threats.

---
Stay tuned for more updates!
