#!/bin/bash

# Store the original directory
OriginalDir=$(pwd)

# Set environment variables
export POSTGRES_USER="nexdefend"
export POSTGRES_PASSWORD="password"
export POSTGRES_DB="nexdefend_db"
export POSTGRES_PORT="5432"
export GO_ENV="development"
export FRONTEND_PORT="3000"
export BACKEND_PORT="5000"

# Paths
SQL_SCRIPT="database/init.sql"
GO_APP_DIR="nexdefend-api"
PYTHON_APP_DIR="nexdefend-ai"
FRONTEND_DIR="nexdefend-frontend"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Exit immediately if a command exits with a non-zero status
set -e

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
    # Go Dependencies
    echo -e "${GREEN}Installing Go dependencies...${NC}"
    if [ -d "$GO_APP_DIR" ]; then
        cd "$GO_APP_DIR"
        if [ -f "go.mod" ]; then
            go mod tidy || { echo -e "${RED}Go dependencies installation failed.${NC}"; exit 1; }
            echo -e "${GREEN}Go dependencies installed successfully!${NC}"
        else
            echo -e "${RED}go.mod file not found. Skipping Go dependencies installation.${NC}"
        fi
        cd "$OriginalDir"
    else
        echo -e "${RED}Go directory path does not exist.${NC}"
    fi

    # Python Dependencies
    echo -e "${GREEN}Installing Python dependencies...${NC}"
    if [ -d "$PYTHON_APP_DIR" ]; then
        cd "$PYTHON_APP_DIR"
        if [ -f "requirements.txt" ]; then
            pip install -r requirements.txt || { echo -e "${RED}Python dependencies installation failed.${NC}"; exit 1; }
            echo -e "${GREEN}Python dependencies installed successfully!${NC}"
        else
            echo -e "${RED}requirements.txt file not found. Skipping Python dependencies installation.${NC}"
        fi
        cd "$OriginalDir"
    else
        echo -e "${RED}Python directory path does not exist.${NC}"
    fi

    # JavaScript Dependencies
    echo -e "${GREEN}Installing JavaScript dependencies (React frontend)...${NC}"
    if [ -d "$FRONTEND_DIR" ]; then
        cd "$FRONTEND_DIR"
        if [ -d "node_modules" ] && [ "$(ls -A node_modules)" ]; then
            echo -e "${GREEN}JavaScript dependencies already installed. Skipping...${NC}"
        else
            npm install || { echo -e "${RED}JavaScript dependencies installation failed.${NC}"; exit 1; }
            echo -e "${GREEN}JavaScript dependencies installed successfully!${NC}"
        fi
        cd "$OriginalDir"
    else
        echo -e "${RED}Frontend directory path does not exist.${NC}"
    fi
}

# Build and Start Backend (Go)
start_backend() {
    echo -e "${GREEN}Starting the Go backend...${NC}"
    cd "$GO_APP_DIR"
    
    # Build the application to check for compile errors
    go build -o nexdefend main.go || { echo -e "${RED}Failed to build the Go application.${NC}"; exit 1; }
    
    # Run the application and capture output
    ./nexdefend > backend.log 2>&1 &
    BACKEND_PID=$!

    sleep 10  # Increase wait time for the backend to start

    # Check if backend is running on the specified port
    if lsof -i :$BACKEND_PORT > /dev/null; then
        echo -e "${GREEN}Backend service running on port $BACKEND_PORT (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}Failed to start the backend service. Check backend.log for details.${NC}"
        exit 1
    fi

    cd "$OriginalDir"
}

# Start Frontend (React)
start_frontend() {
    echo -e "${GREEN}Starting the React frontend...${NC}"
    cd "$FRONTEND_DIR"
    npm start > frontend.log 2>&1 &
    FRONTEND_PID=$!

    sleep 10  # Wait for the frontend to start

    # Check if frontend is running on the specified port
    if lsof -i :$FRONTEND_PORT > /dev/null; then
        echo -e "${GREEN}Frontend running on port $FRONTEND_PORT (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${RED}Failed to start the frontend service. Check frontend.log for details.${NC}"
        exit 1
    fi
    cd "$OriginalDir"
}

# Option to use Docker
use_docker() {
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        echo -e "${GREEN}Starting services using Docker Compose...${NC}"
        docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d
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
