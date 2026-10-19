FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (will be overridden by Render's $PORT)
EXPOSE 8000

# Start server directly without migrations (migrations will run via startup event in main.py)
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
