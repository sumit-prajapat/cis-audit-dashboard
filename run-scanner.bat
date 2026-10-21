@echo off
REM CIS Scanner Runner for Windows
REM This script runs the scanner with interactive token prompt

echo ========================================
echo CIS Security Scanner - Windows
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Navigate to Downloads folder
cd /d "%USERPROFILE%\Downloads"

echo [1/2] Downloading scanner...
echo.

REM Download the scanner
powershell -Command "Invoke-WebRequest -Uri 'https://cis-audit-api.onrender.com/api/v1/downloads/agent/windows' -OutFile 'cis-scanner-windows.exe'"

if not exist "cis-scanner-windows.exe" (
    echo ERROR: Failed to download scanner
    pause
    exit /b 1
)

echo [2/2] Download complete!
echo.
echo Starting scanner...
echo The scanner will prompt you for your authentication token.
echo.

REM Run the scanner (it will prompt for token interactively)
cis-scanner-windows.exe

echo.
echo ========================================
echo Process complete!
echo ========================================
echo.
pause
