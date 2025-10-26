# Script to initialize the data directory for OSDG Web

Write-Host "Initializing OSDG Web data directory..." -ForegroundColor Cyan

# Create data directory if it doesn't exist
if (-not (Test-Path -Path "data")) {
    New-Item -ItemType Directory -Path "data" | Out-Null
    Write-Host "✓ Created data directory" -ForegroundColor Green
} else {
    Write-Host "✓ data directory already exists" -ForegroundColor Green
}

# Create initial projects.json if it doesn't exist
$projectsFile = "data\projects.json"
if (-not (Test-Path -Path $projectsFile)) {
    Write-Host "Creating initial projects.json..." -ForegroundColor Yellow
    "[]" | Out-File -FilePath $projectsFile -Encoding utf8
    Write-Host "✓ Created data\projects.json" -ForegroundColor Green
} else {
    Write-Host "✓ data\projects.json already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Data directory initialized successfully!" -ForegroundColor Green
Write-Host "Location: $PWD\data" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now run:" -ForegroundColor Yellow
Write-Host "  - Development: pnpm dev" -ForegroundColor White
Write-Host "  - Docker: docker-compose up -d" -ForegroundColor White
