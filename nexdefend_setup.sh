#!/bin/bash

# Set environment variables
export POSTGRES_USER="nexdefend"
export POSTGRES_PASSWORD="password"
export POSTGRES_DB="nexdefend_db"
export POSTGRES_PORT="5432"
export GO_ENV="development"
export FRONTEND_PORT="3000"
export BACKEND_PORT="5000"

# Paths
SQL_SCRIPT="database/sql-scripts/init.sql"
GO_APP_DIR="backend/go/nexdefend-api"
PYTHON_APP_DIR="backend/python/nexdefend-ai"
FRONTEND_DIR="frontend/nexdefend-frontend"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ASCII Art for NexDefend
NEXDEFEND_ART=$(cat << "EOF"
  _   _           ____        __                _ 
 | \ | | _____  _|  _ \  ___ / _| ___ _ __   __| |
 |  \| |/ _ \ \/ / | | |/ _ \ |_ / _ \ '_ \ / _` |
 | |\  |  __/>  <| |_| |  __/  _|  __/ | | | (_| |
 |_| \_|\___/_/\_\____/ \___|_|  \___|_| |_|\__,_|
                                                  
EOF
)

echo -e "${GREEN}Starting NexDefend Setup...${NC}"

# Initialize Database
init_database() {
    echo -e "${GREEN}Initializing the database...${NC}"
    psql -U $POSTGRES_USER -d $POSTGRES_DB -f $SQL_SCRIPT
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database initialized successfully!${NC}"
    else
        echo -e "${RED}Failed to initialize the database.${NC}"
        exit 1
    fi
}

# Install Dependencies (Go, Python, JavaScript)
install_dependencies() {
    echo -e "${GREEN}Installing Go dependencies...${NC}"
    cd $GO_APP_DIR && go mod tidy

    echo -e "${GREEN}Installing Python dependencies...${NC}"
    cd $PYTHON_APP_DIR && pip install -r requirements.txt

    echo -e "${GREEN}Installing JavaScript dependencies (React frontend)...${NC}"
    cd $FRONTEND_DIR && npm install
}

# Build and Start Backend (Go)
start_backend() {
    echo -e "${GREEN}Starting the Go backend...${NC}"
    cd $GO_APP_DIR
    go run main.go
    BACKEND_PID=$!
    echo -e "${GREEN}Backend service running on port $BACKEND_PORT (PID: $BACKEND_PID)${NC}"
}

# Start Frontend (React)
start_frontend() {
    echo -e "${GREEN}Starting the React frontend...${NC}"
    cd $FRONTEND_DIR
    npm start & 
    FRONTEND_PID=$!
    echo -e "${GREEN}Frontend running on port $FRONTEND_PORT (PID: $FRONTEND_PID)${NC}"
}

# Option to use Docker
use_docker() {
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo -e "${GREEN}Starting services using Docker Compose...${NC}"
        docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d # Specify the compose file
    else
        echo -e "${RED}Docker Compose file not found. Skipping Docker setup.${NC}"
    fi
}

# Clean up (stopping services)
cleanup() {
    echo -e "${RED}Stopping backend and frontend services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID
    echo -e "${GREEN}Services stopped.${NC}"
}

# Parse input arguments
if [ "$1" == "initdb" ]; then
    init_database
elif [ "$1" == "start" ]; then
    install_dependencies
    start_backend
    start_frontend
elif [ "$1" == "docker" ]; then
    use_docker
elif [ "$1" == "stop" ]; then
    cleanup
else
    echo "$NEXDEFEND_ART"
    echo -e "${GREEN}Usage: ./nexdefend_setup.sh [initdb|start|docker|stop]${NC}"
    echo "initdb - Initialize the PostgreSQL database"
    echo "start  - Install dependencies and start backend & frontend services"
    echo "docker - Run the services using Docker Compose"
    echo "stop   - Stop running backend and frontend services"
fi
