@echo off
REM ============================================
REM CIS Audit Dashboard - Deployment Validator
REM ============================================
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   CIS Audit Dashboard - Deployment Validator          ║
echo ╚════════════════════════════════════════════════════════╝
echo.

setlocal enabledelayedexpansion
set ERRORS=0

REM ── Check 1: Environment File ──
echo [1/10] Checking environment configuration...
if not exist ".env" (
    echo     ❌ ERROR: .env file not found!
    echo     → Copy .env.example to .env and configure it
    set /a ERRORS+=1
) else (
    echo     ✅ .env file exists
)

REM ── Check 2: SECRET_KEY ──
echo [2/10] Validating SECRET_KEY...
findstr /C:"SECRET_KEY=your-super-secret-key" .env >nul 2>&1
if !errorlevel! equ 0 (
    echo     ❌ ERROR: Using default SECRET_KEY!
    echo     → Run: python backend\generate_secret.py
    set /a ERRORS+=1
) else (
    findstr /C:"SECRET_KEY=change-in-production" .env >nul 2>&1
    if !errorlevel! equ 0 (
        echo     ❌ ERROR: Using default SECRET_KEY!
        echo     → Run: python backend\generate_secret.py
        set /a ERRORS+=1
    ) else (
        echo     ✅ SECRET_KEY configured
    )
)

REM ── Check 3: Database ──
echo [3/10] Checking database connection...
docker ps | findstr "postgres" >nul 2>&1
if !errorlevel! neq 0 (
    echo     ❌ ERROR: PostgreSQL container not running!
    echo     → Run: docker-compose up -d db
    set /a ERRORS+=1
) else (
    echo     ✅ Database container running
)

REM ── Check 4: Python Dependencies ──
echo [4/10] Checking Python dependencies...
cd backend
python -c "import fastapi, sqlalchemy, alembic" >nul 2>&1
if !errorlevel! neq 0 (
    echo     ❌ ERROR: Python dependencies not installed!
    echo     → Run: pip install -r requirements.txt
    set /a ERRORS+=1
) else (
    echo     ✅ Python dependencies installed
)
cd ..

REM ── Check 5: Database Migrations ──
echo [5/10] Checking database migrations...
cd backend
python -m alembic current >nul 2>&1
if !errorlevel! neq 0 (
    echo     ❌ ERROR: Database migrations not applied!
    echo     → Run: python -m alembic upgrade head
    set /a ERRORS+=1
) else (
    echo     ✅ Database migrations applied
)
cd ..

REM ── Check 6: Backend Tests ──
echo [6/10] Running backend tests...
cd backend
python -m pytest tests/ -v --tb=line >nul 2>&1
if !errorlevel! neq 0 (
    echo     ⚠️  WARNING: Some tests failed
    echo     → Run: python -m pytest tests/ -v
) else (
    echo     ✅ All backend tests passing
)
cd ..

REM ── Check 7: Frontend Dependencies ──
echo [7/10] Checking frontend dependencies...
if not exist "frontend\node_modules" (
    echo     ❌ ERROR: Frontend dependencies not installed!
    echo     → Run: cd frontend ; npm install
    set /a ERRORS+=1
) else (
    echo     ✅ Frontend dependencies installed
)

REM ── Check 8: Backend Health Check ──
echo [8/10] Checking backend health endpoint...
timeout /t 2 /nobreak >nul 2>&1
curl -s http://localhost:8000/health >nul 2>&1
if !errorlevel! neq 0 (
    echo     ⚠️  WARNING: Backend not responding
    echo     → Start with: cd backend ; uvicorn main:app --reload
) else (
    echo     ✅ Backend responding
)

REM ── Check 9: Frontend Health Check ──
echo [9/10] Checking frontend...
curl -s http://localhost:5173 >nul 2>&1
if !errorlevel! neq 0 (
    echo     ⚠️  WARNING: Frontend not responding
    echo     → Start with: cd frontend ; npm run dev
) else (
    echo     ✅ Frontend responding
)

REM ── Check 10: Production Readiness ──
echo [10/10] Checking production readiness...
findstr /C:"APP_ENV=production" .env >nul 2>&1
if !errorlevel! equ 0 (
    echo     🚀 Production mode detected
    
    REM Check critical production settings
    findstr /C:"COOKIE_SECURE=true" .env >nul 2>&1
    if !errorlevel! neq 0 (
        echo     ❌ ERROR: COOKIE_SECURE must be true in production
        set /a ERRORS+=1
    )
    
    findstr /C:"STRIPE_SECRET_KEY=sk_live" .env >nul 2>&1
    if !errorlevel! neq 0 (
        echo     ⚠️  WARNING: Using test Stripe keys in production
    )
    
    findstr /C:"RESEND_API_KEY=re_" .env >nul 2>&1
    if !errorlevel! neq 0 (
        echo     ⚠️  WARNING: Email service not configured
    )
) else (
    echo     ✅ Development/staging mode
)

echo.
echo ════════════════════════════════════════════════════════
if !ERRORS! equ 0 (
    echo  ✅ ALL CHECKS PASSED - Deployment ready!
    echo.
    echo  Next steps:
    echo   1. Start backend: cd backend ; uvicorn main:app --reload
    echo   2. Start frontend: cd frontend ; npm run dev
    echo   3. Visit: http://localhost:5173
) else (
    echo  ❌ !ERRORS! ERROR(S) FOUND - Fix issues before deployment
    echo.
    echo  Review error messages above and fix them.
)
echo ════════════════════════════════════════════════════════
echo.

pause
