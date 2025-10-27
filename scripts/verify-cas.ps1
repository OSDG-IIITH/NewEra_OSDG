# CAS Authentication Verification Script (Windows)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "CAS Authentication Configuration Check" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if files exist
Write-Host "Checking configuration files..." -ForegroundColor Blue

if (Test-Path "src\app\api\auth\cas\login\route.ts") {
    Write-Host "✓ Login route exists" -ForegroundColor Green
    
    # Check if it has the correct CAS URL
    $content = Get-Content "src\app\api\auth\cas\login\route.ts" -Raw
    if ($content -match "login-test2.iiit.ac.in") {
        Write-Host "✓ Using login-test2.iiit.ac.in" -ForegroundColor Green
    } else {
        Write-Host "✗ Not using login-test2.iiit.ac.in" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Login route missing" -ForegroundColor Red
}

if (Test-Path "src\app\api\auth\cas\callback\route.ts") {
    Write-Host "✓ Callback route exists" -ForegroundColor Green
    
    # Check if it has the correct CAS URL
    $content = Get-Content "src\app\api\auth\cas\callback\route.ts" -Raw
    if ($content -match "login-test2.iiit.ac.in") {
        Write-Host "✓ Using login-test2.iiit.ac.in" -ForegroundColor Green
    } else {
        Write-Host "✗ Not using login-test2.iiit.ac.in" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Callback route missing" -ForegroundColor Red
}

if (Test-Path "src\contexts\AuthContext.tsx") {
    Write-Host "✓ AuthContext exists" -ForegroundColor Green
    
    # Check if it has the login function
    $content = Get-Content "src\contexts\AuthContext.tsx" -Raw
    if ($content -match "window.location.href = loginUrl") {
        Write-Host "✓ Uses full page redirect" -ForegroundColor Green
    } else {
        Write-Host "⚠ Login method might need review" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ AuthContext missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Checking Docker configuration..." -ForegroundColor Blue

if (Test-Path "docker-compose.yml") {
    Write-Host "✓ docker-compose.yml exists" -ForegroundColor Green
    
    $content = Get-Content "docker-compose.yml" -Raw
    if ($content -match "CAS_BASE_URL") {
        Write-Host "✓ CAS_BASE_URL configured" -ForegroundColor Green
        $lines = Get-Content "docker-compose.yml" | Select-String "CAS_BASE_URL"
        foreach ($line in $lines) {
            Write-Host "   $($line.Line.Trim())" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠ CAS_BASE_URL not set (will use default)" -ForegroundColor Yellow
    }
} else {
    Write-Host "✗ docker-compose.yml missing" -ForegroundColor Red
}

if (Test-Path "docker-compose.prod.yml") {
    Write-Host "✓ docker-compose.prod.yml exists" -ForegroundColor Green
    
    $content = Get-Content "docker-compose.prod.yml" -Raw
    if ($content -match "CAS_BASE_URL") {
        Write-Host "✓ Production CAS_BASE_URL configured" -ForegroundColor Green
        $lines = Get-Content "docker-compose.prod.yml" | Select-String "CAS_BASE_URL"
        foreach ($line in $lines) {
            Write-Host "   $($line.Line.Trim())" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠ Production CAS_BASE_URL not set" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ docker-compose.prod.yml missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Expected CAS Flow:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. User clicks 'CAS Login'" -ForegroundColor White
Write-Host "2. Redirects to: " -NoNewline -ForegroundColor White
Write-Host "/api/auth/cas/login" -ForegroundColor Green
Write-Host "3. Backend redirects to: " -NoNewline -ForegroundColor White
Write-Host "https://login-test2.iiit.ac.in/cas/login" -ForegroundColor Green
Write-Host "4. User enters credentials" -ForegroundColor White
Write-Host "5. CAS redirects back to: " -NoNewline -ForegroundColor White
Write-Host "/api/auth/cas/callback?ticket=ST-xxx" -ForegroundColor Green
Write-Host "6. Backend validates ticket" -ForegroundColor White
Write-Host "7. Redirects to: " -NoNewline -ForegroundColor White
Write-Host "/?casAuth=success&username=...&name=...&email=..." -ForegroundColor Green
Write-Host "8. Frontend reads params and logs in user ✅" -ForegroundColor White
Write-Host ""

Write-Host "Testing URLs:" -ForegroundColor Blue
Write-Host ""
Write-Host "Localhost:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Green
Write-Host "Production: " -NoNewline -ForegroundColor White
Write-Host "https://osdg.in" -ForegroundColor Green
Write-Host ""

Write-Host "To test:" -ForegroundColor Blue
Write-Host "1. Development: " -NoNewline -ForegroundColor White
Write-Host "pnpm dev" -ForegroundColor Yellow
Write-Host "2. Docker:      " -NoNewline -ForegroundColor White
Write-Host "docker-compose up -d" -ForegroundColor Yellow
Write-Host "3. Production:  " -NoNewline -ForegroundColor White
Write-Host "docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor Yellow
Write-Host ""

Write-Host "Configuration check complete!" -ForegroundColor Green
Write-Host ""
Write-Host "For detailed testing, see: CAS_TESTING_GUIDE.md" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
