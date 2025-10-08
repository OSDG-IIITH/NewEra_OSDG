# IIIT Hyderabad VPN Setup Script for Windows
# Compatible with: Windows 10, Windows 11
# Author: OSDG Club, IIIT Hyderabad
# Last Updated: October 2025

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  IIIT Hyderabad VPN Setup - Windows" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$ConfigPath = "$env:USERPROFILE\Downloads\windows.ovpn"
$OpenVPNDownloadUrl = "https://openvpn.net/downloads/openvpn-connect-v3-windows.msi"
$TempMSI = "$env:TEMP\openvpn-connect.msi"

# Check if running as Administrator
$IsAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $IsAdmin) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check internet connectivity
function Test-InternetConnection {
    try {
        $null = Test-Connection -ComputerName "openvpn.net" -Count 1 -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

# Check internet connection
Write-Host "[1/4] Checking internet connection..." -ForegroundColor Yellow
if (-not (Test-InternetConnection)) {
    Write-Host "ERROR: No internet connection detected" -ForegroundColor Red
    Write-Host "Please connect to the internet and try again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Internet connection verified" -ForegroundColor Green
Write-Host ""

# Check if config file exists
Write-Host "[2/4] Checking for VPN configuration file..." -ForegroundColor Yellow
if (-not (Test-Path $ConfigPath)) {
    Write-Host "ERROR: Configuration file not found!" -ForegroundColor Red
    Write-Host "Expected location: $ConfigPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Download 'windows.ovpn' from the OSDG website" -ForegroundColor Yellow
    Write-Host "  2. Save it to your Downloads folder" -ForegroundColor Yellow
    Write-Host "  3. Run this script again" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 2
}
Write-Host "[OK] Configuration file found" -ForegroundColor Green
Write-Host ""

# Check if OpenVPN Connect is installed
Write-Host "[3/4] Checking OpenVPN Connect installation..." -ForegroundColor Yellow
$OpenVPNPath = "C:\Program Files\OpenVPN Connect\OpenVPNConnect.exe"
if (Test-Path $OpenVPNPath) {
    Write-Host "[OK] OpenVPN Connect is already installed" -ForegroundColor Green
} else {
    Write-Host "OpenVPN Connect not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "  Downloading installer..." -ForegroundColor Cyan
    try {
        # Download with visual progress feedback
        $WebClient = New-Object System.Net.WebClient
        
        # Event handler for download progress
        Register-ObjectEvent -InputObject $WebClient -EventName DownloadProgressChanged -Action {
            $Percent = $EventArgs.ProgressPercentage
            $Received = [math]::Round($EventArgs.BytesReceived / 1MB, 2)
            $Total = [math]::Round($EventArgs.TotalBytesToReceive / 1MB, 2)
            
            # Create progress bar [####------]
            $BarLength = 20
            $FilledLength = [math]::Floor($Percent / 100 * $BarLength)
            $Bar = ("#" * $FilledLength).PadRight($BarLength, "-")
            
            Write-Host "`r  [$Bar] $Percent% ($Received MB / $Total MB)" -NoNewline -ForegroundColor Cyan
        } | Out-Null
        
        # Start download
        $WebClient.DownloadFile($OpenVPNDownloadUrl, $TempMSI)
        $WebClient.Dispose()
        
        Write-Host ""
        Write-Host "  [OK] Download complete" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "ERROR: Failed to download OpenVPN Connect" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    
    Write-Host "  Installing (this may take a minute)..." -ForegroundColor Cyan
    try {
        $InstallProcess = Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$TempMSI`" /quiet /norestart" -Wait -PassThru
        if ($InstallProcess.ExitCode -ne 0) {
            throw "Installation failed with exit code $($InstallProcess.ExitCode)"
        }
        Write-Host "  [OK] Installation complete" -ForegroundColor Green
        
        # Clean up installer
        Remove-Item $TempMSI -Force -ErrorAction SilentlyContinue
    } catch {
        Write-Host "ERROR: Installation failed" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}
Write-Host ""

# Step 4: Handle first-time GDPR acceptance and import profile
Write-Host "[4/4] Setting up VPN profile..." -ForegroundColor Yellow

# Check if this is the first time launching OpenVPN Connect
$firstLaunch = $false
$appDataPath = Join-Path $env:LOCALAPPDATA "OpenVPN Connect"
if (-not (Test-Path $appDataPath)) {
    $firstLaunch = $true
}

if ($firstLaunch) {
    # First launch: User needs to accept GDPR terms
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host "OpenVPN Connect will now open for the first time." -ForegroundColor Cyan
    Write-Host "  " -NoNewline
    Write-Host "Please click the " -NoNewline -ForegroundColor White
    Write-Host "'Agree' " -NoNewline -ForegroundColor Green
    Write-Host "button to accept the terms." -ForegroundColor White
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host "Press any key after you've clicked Agree..." -ForegroundColor Yellow
    Write-Host ""
    
    # Launch OpenVPN Connect (this shows the GDPR dialog)
    Start-Process $OpenVPNPath -WindowStyle Normal
    
    # Wait for user to accept GDPR
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Write-Host ""
    Write-Host "  " -NoNewline
    Write-Host "Thank you! Closing OpenVPN and importing your profile..." -ForegroundColor Cyan
    
    # Close OpenVPN Connect windows
    Start-Sleep -Seconds 2
    Get-Process -Name "OpenVPNConnect" -ErrorAction SilentlyContinue | ForEach-Object {
        $_.CloseMainWindow() | Out-Null
    }
    Start-Sleep -Seconds 1
} else {
    Write-Host "  Preparing to import profile..." -ForegroundColor Cyan
}

# Import the VPN profile using OpenVPN Connect CLI
Write-Host "  Importing VPN profile..." -ForegroundColor Cyan
try {
    $importArgs = "--import-profile=`"$ConfigPath`""
    & $OpenVPNPath $importArgs 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "  [OK] VPN profile imported successfully!" -ForegroundColor Green
} catch {
    Write-Host "  [FAIL] Failed to import VPN profile" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Set launch option to connect to latest profile automatically
Write-Host "  Configuring auto-connect..." -ForegroundColor Cyan
try {
    & $OpenVPNPath --set-setting=launch-options --value=connect-latest 2>&1 | Out-Null
    Write-Host "  [OK] Auto-connect enabled" -ForegroundColor Green
} catch {
    Write-Host "  [SKIP] Could not set auto-connect" -ForegroundColor Yellow
}
Write-Host ""

# Launch OpenVPN Connect - it should now show the imported profile and prompt for credentials
Write-Host "Launching OpenVPN Connect..." -ForegroundColor Cyan
Start-Process -FilePath $OpenVPNPath

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. OpenVPN Connect window will open"
Write-Host "  2. Click on the 'IIITH-VPN' profile"
Write-Host "  3. Enter your IIIT Hyderabad credentials:"
Write-Host "     Username: your-email@students.iiit.ac.in" -ForegroundColor Yellow
Write-Host "     Password: your IIIT-H password" -ForegroundColor Yellow
Write-Host ""
Write-Host "Need help? Visit the OSDG website or use WISPR AI!" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"
