@echo off
title CIS Audit Dashboard - Setup Test
echo ========================================
echo  TESTING PREREQUISITES
echo ========================================
echo.

set ERROR=0

echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Python not found!
    echo Install from: https://www.python.org/downloads/
    set ERROR=1
) else (
    python --version
    echo [OK] Python installed
)
echo.

echo [2/4] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Node.js not found!
    echo Install from: https://nodejs.org/
    set ERROR=1
) else (
    node --version
    echo [OK] Node.js installed
)
echo.

echo [3/4] Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] npm not found!
    set ERROR=1
) else (
    npm --version
    echo [OK] npm installed
)
echo.

echo [4/4] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [FAIL] Docker not found!
    echo Install from: https://www.docker.com/products/docker-desktop/
    set ERROR=1
) else (
    docker --version
    echo [OK] Docker installed
)
echo.

echo ========================================
if %ERROR%==0 (
    echo  ALL TESTS PASSED!
    echo  Run START_PROJECT.bat to begin
) else (
    echo  SETUP INCOMPLETE - Install missing tools
)
echo ========================================
echo.
pause
