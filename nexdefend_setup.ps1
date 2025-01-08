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
function Write-Message {
    param (
        [string]$Message
    )
    Write-Host -ForegroundColor Green $Message
}

# Function to print error messages
function Write-ErrorMessage {
    param (
        [string]$Message
    )
    Write-Host -ForegroundColor Red $Message
}

# Function to initialize the database
function Initialize-Database {
    Write-Message "Initializing the database..."
    docker-compose up -d db
    Start-Sleep -Seconds 10  # Wait for the database to be ready
    docker exec -i $(docker-compose ps -q db) psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB < $SQL_SCRIPT
}

# Function to build and run the Go application
function Start-GoApp {
    Write-Message "Building and starting the Go application..."
    Set-Location $GO_APP_DIR
    go build -o nexdefend
    Start-Process -NoNewWindow -FilePath "./nexdefend"
    Set-Location $OriginalDir
}

# Function to run the Python application
function Start-PythonApp {
    Write-Message "Starting the Python application..."
    Set-Location $PYTHON_APP_DIR
    python -m venv venv
    .\venv\Scripts\Activate
    pip install -r requirements.txt
    Start-Process -NoNewWindow -FilePath "python" -ArgumentList "app.py"
    Set-Location $OriginalDir
}

# Function to run the frontend application
function Start-FrontendApp {
    Write-Message "Running the frontend application..."
    Set-Location $FRONTEND_DIR
    npm install
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "start"
    Set-Location $OriginalDir
}

# Function to run Docker Compose
function Start-DockerCompose {
    Write-Message "Starting Docker Compose..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
}

# Main script execution
Write-Message $NEXDEFEND_ART
Write-Message "Starting NexDefend setup..."

try {
    # Manual initialization steps
    Initialize-Database
    Start-PythonApp
    Start-GoApp
    Start-FrontendApp

    # Menu option for Docker
    $startDocker = Read-Host "Do you want to start Docker Compose? (y/n)"
    if ($startDocker -eq "y") {
        Start-DockerCompose
    }

    Write-Message "NexDefend setup completed successfully!"
}
catch {
    Write-ErrorMessage "Error during NexDefend setup: $_"
}