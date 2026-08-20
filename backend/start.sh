#!/bin/bash

# Hugging Face Spaces startup script

# Set environment variables
export APP_ENV=production
export PYTHONUNBUFFERED=1

# Run database migrations (if using persistent storage)
# python -m alembic upgrade head

# Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port 7860
