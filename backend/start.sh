#!/bin/bash
set -e

echo "🚀 Starting CIS Audit Dashboard Backend..."

# Run database migrations (non-blocking)
echo "📦 Running database migrations..."
if python -m alembic upgrade head; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migrations failed or skipped - continuing anyway"
fi

# Start the server
echo "🌐 Starting Uvicorn server on port ${PORT:-8000}..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WORKERS:-1}
