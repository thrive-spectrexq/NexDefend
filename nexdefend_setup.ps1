# Set environment variables
$env:POSTGRES_USER = "nexdefend"
$env:POSTGRES_PASSWORD = "password"
$env:POSTGRES_DB = "nexdefend_db"
$env:POSTGRES_PORT = "5432"
$env:GO_ENV = "development"
$env:FRONTEND_PORT = "3000"
$env:BACKEND_PORT = "8080"

# Paths
$SQL_SCRIPT = "database/init.sql"
$GO_APP_DIR = "."
$PYTHON_APP_DIR = "nexdefend-ai"
$FRONTEND_DIR = "nexdefend-frontend"
$DOCKER_COMPOSE_FILE = "docker-compose.yml"

# Capture the original directory
$OriginalDir = Get-Location

# ASCII Art for NexDefend
$NEXDEFEND_ART = @"
  _   _           ____        __                _ 
 | \ | | _____  _|  _ \  ___ / _| ___ _ __   __| |
 |  \| |/ _ \ \/ / | | |/ _ \ |_ / _ \ '_ \ / _` |
 | |\  |  __/>  <| |_| |  __/  _|  __/ | | | (_| |
 |_| \_|\___/_/\_\____/ \___|_|  \___|_| |_|\__,_| 
"@

# Function to print messages
function Print-Message {
    param (
        [string]$Message
    )
    Write-Host -ForegroundColor Green $Message
}

# Function to print error messages
function Print-Error {
    param (
        [string]$Message
    )
    Write-Host -ForegroundColor Red $Message
}

# Function to run Docker Compose
function Run-DockerCompose {
    Print-Message "Starting Docker Compose..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
}

# Function to initialize the database
function Initialize-Database {
    Print-Message "Initializing the database..."
    docker exec -i $(docker-compose ps -q db) psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB < $SQL_SCRIPT
}

# Function to build and run the Go application
function Run-GoApp {
    Print-Message "Building and running the Go application..."
    Set-Location $GO_APP_DIR
    go build -o nexdefend
    Start-Process -NoNewWindow -FilePath "./nexdefend"
    Set-Location $OriginalDir
}

# Function to run the Python application
function Run-PythonApp {
    Print-Message "Running the Python application..."
    Set-Location $PYTHON_APP_DIR
    python -m venv venv
    .\venv\Scripts\Activate
    pip install -r requirements.txt
    Start-Process -NoNewWindow -FilePath "python" -ArgumentList "app.py"
    Set-Location $OriginalDir
}

# Function to run the frontend application
function Run-FrontendApp {
    Print-Message "Running the frontend application..."
    Set-Location $FRONTEND_DIR
    npm install
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"
    Set-Location $OriginalDir
}

# Main script execution
Print-Message $NEXDEFEND_ART
Print-Message "Starting NexDefend setup..."

try {
    Run-DockerCompose
    Initialize-Database
    Run-GoApp
    Run-PythonApp
    Run-FrontendApp
    Print-Message "NexDefend setup completed successfully!"
} catch {
    Print-Error "Error during NexDefend setup: $_"
}