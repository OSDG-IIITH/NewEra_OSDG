# OSDG Web - Docker Deployment Helper Script (Windows)

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║    OSDG Web - Docker Deployment       ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✓ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker from: https://docs.docker.com/get-docker/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✓ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker Compose is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Compose from: https://docs.docker.com/compose/install/" -ForegroundColor Yellow
    exit 1
}

# Initialize data directory
Write-Host ""
Write-Host "Initializing data directory..." -ForegroundColor Yellow
.\scripts\init-data.ps1

# Build and start containers
Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker-compose build

Write-Host ""
Write-Host "Starting container..." -ForegroundColor Yellow
docker-compose up -d

# Wait for container to be healthy
Write-Host ""
Write-Host "Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if container is running
$containerStatus = docker-compose ps --format json | ConvertFrom-Json
if ($containerStatus.State -eq "running") {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     Deployment Successful! 🎉          ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application URL: " -NoNewline -ForegroundColor Blue
    Write-Host "http://localhost:3000" -ForegroundColor White
    Write-Host "Data Location: " -NoNewline -ForegroundColor Blue
    Write-Host "$PWD\data" -ForegroundColor White
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "  View logs:        docker-compose logs -f" -ForegroundColor White
    Write-Host "  Stop container:   docker-compose down" -ForegroundColor White
    Write-Host "  Restart:          docker-compose restart" -ForegroundColor White
    Write-Host "  View status:      docker-compose ps" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Container failed to start" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
