@echo off
echo Running CIS Audit Dashboard Tests...
echo.

python -m pytest tests/ -v --tb=short

echo.
echo Tests complete!
pause
