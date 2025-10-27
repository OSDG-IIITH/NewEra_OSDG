# Restart Development Server - Fixes CAS Authentication Issues
# This script stops all Node.js processes and clears the Next.js cache

Write-Host "🔄 Restarting development server..." -ForegroundColor Cyan
Write-Host ""

# Stop all Node.js processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✓ Node.js processes stopped" -ForegroundColor Green

# Clear Next.js cache
Write-Host ""
Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✓ Removed .next directory" -ForegroundColor Green
}

# Clear node_modules/.cache if it exists
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✓ Removed node_modules/.cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cache cleared successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Now run:" -ForegroundColor Yellow
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "The CAS authentication will now use:" -ForegroundColor Cyan
Write-Host "  https://login-test2.iiit.ac.in/cas/login" -ForegroundColor Green
