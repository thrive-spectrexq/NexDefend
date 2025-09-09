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
export BACKEND_PORT="8080"

# Paths
SQL_SCRIPT="database/init.sql"
GO_APP_DIR="."
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

# Function to print messages
print_message() {
  echo -e "${GREEN}$1${NC}"
}

# Function to print error messages
print_error() {
  echo -e "${RED}$1${NC}"
}

# Function to initialize the database
initialize_database() {
  print_message "Initializing the database..."
  docker-compose up -d db
  sleep 10  # Wait for the database to be ready
  docker exec -i $(docker-compose ps -q db) psql -U $POSTGRES_USER -d $POSTGRES_DB < $SQL_SCRIPT
}

# Function to build and run the Go application
run_go_app() {
  print_message "Building and running the Go application..."
  cd $GO_APP_DIR
  go build -o nexdefend
  ./nexdefend &
  cd $OriginalDir
}

# Function to run the Python application
run_python_app() {
  print_message "Running the Python application..."
  cd $PYTHON_APP_DIR
  python3 -m venv venv
  source venv/bin/activate
  pip install -r requirements.txt
  python api.py &
  cd $OriginalDir
}

# Function to run the frontend application
run_frontend_app() {
  print_message "Running the frontend application..."
  cd $FRONTEND_DIR
  npm install
  npm start &
  cd $OriginalDir
}

# Function to run Docker Compose
run_docker_compose() {
  print_message "Starting Docker Compose..."
  docker-compose -f $DOCKER_COMPOSE_FILE up -d
}

# Main script execution
print_message "$NEXDEFEND_ART"
print_message "Starting NexDefend setup..."

if [ "$1" == "docker" ]; then
  print_message "Starting Docker Compose Setup..."
  run_docker_compose
  print_message "Docker Compose setup completed successfully!"
else
  print_message "Starting Manual Setup..."
  initialize_database
  run_python_app
  run_go_app
  run_frontend_app
  print_message "Manual Setup completed successfully!"
fi

print_message "NexDefend setup completed!"