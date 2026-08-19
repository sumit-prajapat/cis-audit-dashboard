@echo off
title CIS Audit Dashboard - Startup
echo ========================================
echo  CIS AUDIT DASHBOARD - QUICK START
echo ========================================
echo.

echo [1/4] Starting PostgreSQL Database...
docker-compose up -d db
timeout /t 10 /nobreak > nul
echo.

echo [2/4] Running Database Migrations...
cd backend
python -m alembic upgrade head
cd ..
echo.

echo [3/4] Starting Backend (FastAPI)...
start "Backend API" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 5 /nobreak > nul
echo.

echo [4/4] Starting Frontend (React)...
start "Frontend Dev Server" cmd /k "cd frontend && npm install && npm run dev"
echo.

echo ========================================
echo  All services starting!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo API Docs:     http://localhost:8000/api/docs
echo Frontend:     http://localhost:5173
echo.
echo Press any key to exit this window...
pause > nul
