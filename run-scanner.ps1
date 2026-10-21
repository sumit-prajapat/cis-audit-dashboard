# CIS Scanner Runner for Windows (PowerShell)
# Run this as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CIS Security Scanner - Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

# Navigate to Downloads folder
$downloadsPath = "$env:USERPROFILE\Downloads"
Set-Location $downloadsPath

Write-Host "[1/2] Downloading scanner..." -ForegroundColor Green

# Download the scanner
try {
    Invoke-WebRequest -Uri "https://cis-audit-api.onrender.com/api/v1/downloads/agent/windows" -OutFile "cis-scanner-windows.exe"
    Write-Host "[2/2] Download complete!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to download scanner" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Starting scanner..." -ForegroundColor Green
Write-Host "The scanner will prompt you for your authentication token." -ForegroundColor Yellow
Write-Host ""

# Run the scanner (it will prompt for token interactively)
try {
    & ".\cis-scanner-windows.exe"
} catch {
    Write-Host "ERROR: Failed to run scanner" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Process complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pause
