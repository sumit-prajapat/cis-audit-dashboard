@echo off
REM Database Migration Helper Script for Windows

if "%1"=="" goto usage
if "%1"=="help" goto usage

if "%1"=="upgrade" goto upgrade
if "%1"=="current" goto current
if "%1"=="history" goto history
if "%1"=="downgrade" goto downgrade
if "%1"=="create" goto create

:usage
echo.
echo Database Migration Helper
echo ========================
echo.
echo Usage: migrate.bat [command] [options]
echo.
echo Commands:
echo   upgrade       Apply all pending migrations
echo   current       Show current migration version
echo   history       Show migration history
echo   downgrade     Rollback one migration
echo   create "msg"  Create new migration with message
echo   help          Show this help
echo.
echo Examples:
echo   migrate.bat upgrade
echo   migrate.bat create "Add user preferences"
echo   migrate.bat downgrade
echo.
goto end

:upgrade
echo Applying migrations...
python -m alembic upgrade head
goto end

:current
echo Current migration version:
python -m alembic current
goto end

:history
echo Migration history:
python -m alembic history --verbose
goto end

:downgrade
echo Rolling back one migration...
python -m alembic downgrade -1
goto end

:create
if "%2"=="" (
    echo Error: Migration message required
    echo Usage: migrate.bat create "Your message here"
    goto end
)
echo Creating new migration...
python -m alembic revision --autogenerate -m %2
echo.
echo Migration created! Review it in alembic/versions/ before applying.
goto end

:end
