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

Write-Host "Starting NexDefend Setup..."

# Initialize Database
function Initialize-Database {
    Write-Host "Initializing the database..."
    psql -U $env:POSTGRES_USER -d $env:POSTGRES_DB -f $SQL_SCRIPT
    if ($?) {
        Write-Host "Database initialized successfully!"
    }
    else {
        Write-Host "Failed to initialize the database." -ForegroundColor Red
        exit 1
    }
}

# Install Dependencies (Go, Python, JavaScript)
function Install-Dependencies {
    Write-Host "Installing Go dependencies..."
    Set-Location $GO_APP_DIR
    if (!(Test-Path "go.sum")) {
        go mod tidy
    }
    else {
        Write-Host "Go dependencies are already installed. Skipping..."
    }
    Set-Location $OriginalDir  # Return to the original directory

    Write-Host "Installing Python dependencies..."
    if (Test-Path $PYTHON_APP_DIR) {
        Set-Location $PYTHON_APP_DIR
        if (!(pip freeze | Select-String -Pattern "Flask")) {
            pip install -r requirements.txt
        }
        else {
            Write-Host "Python dependencies are already installed. Skipping..."
        }
        Set-Location $OriginalDir  # Return to the original directory
    }
    else {
        Write-Host "Python directory path does not exist." -ForegroundColor Red
    }

    Write-Host "Installing JavaScript dependencies (React frontend)..."
    if (Test-Path $FRONTEND_DIR) {
        Set-Location $FRONTEND_DIR
        if (!(Test-Path "node_modules")) {
            npm install
        }
        else {
            Write-Host "JavaScript dependencies are already installed. Skipping..."
        }
        Set-Location $OriginalDir  # Return to the original directory
    }
    else {
        Write-Host "Frontend directory path does not exist." -ForegroundColor Red
    }
}

# Build and Start Backend (Go)
function Start-Backend {
    Write-Host "Starting the Go backend..."
    Set-Location $GO_APP_DIR
    Start-Process go -ArgumentList "run main.go"
    Write-Host "Backend service running on port $env:BACKEND_PORT"
    Set-Location $OriginalDir  # Return to the original directory
}

# Start Frontend (React)
function Start-Frontend {
    Write-Host "Starting the React frontend..."
    if (Test-Path $FRONTEND_DIR) {
        Set-Location $FRONTEND_DIR
        Start-Process npm -ArgumentList "start"
        Write-Host "Frontend running on port $env:FRONTEND_PORT"
        Set-Location $OriginalDir  # Return to the original directory
    }
    else {
        Write-Host "Frontend directory path does not exist." -ForegroundColor Red
    }
}

# Option to use Docker
function Use-Docker {
    if (Test-Path $DOCKER_COMPOSE_FILE) {
        Write-Host "Starting services using Docker Compose..."
        docker-compose -f $DOCKER_COMPOSE_FILE up --build -d
    }
    else {
        Write-Host "Docker Compose file not found. Skipping Docker setup." -ForegroundColor Red
    }
}

# Clean up (stopping services)
function Cleanup {
    Write-Host "Stopping backend and frontend services..." -ForegroundColor Red
    Stop-Process -Name "go" -Force
    Stop-Process -Name "npm" -Force
    Write-Host "Services stopped."
}

# Parse input arguments
if ($args[0] -eq "initdb") {
    Initialize-Database
}
elseif ($args[0] -eq "start") {
    Install-Dependencies
    Start-Backend
    Start-Frontend
}
elseif ($args[0] -eq "docker") {
    Use-Docker
}
elseif ($args[0] -eq "stop") {
    Cleanup
}
else {
    Write-Host $NEXDEFEND_ART
    Write-Host "Usage: ./nexdefend_setup.ps1 [initdb|start|docker|stop]"
    Write-Host "initdb - Initialize the PostgreSQL database"
    Write-Host "start  - Install dependencies and start backend & frontend services"
    Write-Host "docker - Run the services using Docker Compose"
    Write-Host "stop   - Stop running backend and frontend services"
}
