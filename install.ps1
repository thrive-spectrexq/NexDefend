# install.ps1
# NexDefend Offline Installer for Windows

Write-Host "🛡️  Installing NexDefend Enterprise (Offline Mode)..." -ForegroundColor Cyan

# 1. Check for Docker
if (-not (Get-Command "docker" -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Docker is not installed or not in PATH. Please install Docker Desktop first."
    exit 1
}

# 2. Check for the Images Archive
$ImagesArchive = "images.tar.gz"
if (-not (Test-Path $ImagesArchive)) {
    Write-Error "❌ Error: $ImagesArchive not found in the current directory."
    exit 1
}

# 3. Load Docker Images
Write-Host "⏳ Loading Docker images from archive (this will take time)..." -ForegroundColor Yellow
# We use 'Get-Content' piped to docker load for better Windows compatibility with gzip
# Alternatively, simpler direct load if docker supports it on Windows:
docker load -i $ImagesArchive

# 4. Start Services
Write-Host "🚀 Starting Services..." -ForegroundColor Green
docker-compose up -d

Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host "✅ Installation Complete" -ForegroundColor Green
Write-Host "🌐 Access NexDefend at: http://localhost"
Write-Host "----------------------------------------" -ForegroundColor Cyan
