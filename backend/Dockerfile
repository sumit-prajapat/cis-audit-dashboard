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

# Run migrations and start server
# Note: Render provides $PORT environment variable
CMD python -m alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
