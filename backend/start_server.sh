#!/bin/bash
# Production startup script for CIS Audit Dashboard
# This script ensures the server starts correctly regardless of database/migration state

set -e  # Exit on error

echo "🚀 CIS Audit Dashboard - Starting Production Server"
echo "=================================================="

# Display environment info
echo "📍 Environment: ${APP_ENV:-production}"
echo "🐍 Python version: $(python --version)"
echo "📦 Working directory: $(pwd)"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL not set! Using SQLite fallback."
    export DATABASE_URL="sqlite:////tmp/cis_audit.db"
fi

# Extract database type
if [[ $DATABASE_URL == sqlite* ]]; then
    echo "💾 Database: SQLite (development mode)"
elif [[ $DATABASE_URL == postgres* ]]; then
    echo "💾 Database: PostgreSQL (production mode)"
else
    echo "💾 Database: Unknown type"
fi

# Display port
PORT=${PORT:-8000}
echo "🌐 Port: $PORT"

echo "=================================================="
echo ""

# Start the server
echo "✅ Starting Uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1 --log-level info
