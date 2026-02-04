FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for kafka-python/confluent-kafka or others)
# Clean up apt cache to keep image small
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libc-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user
RUN useradd -m appuser
USER appuser

# Copy application code with ownership
COPY --chown=appuser:appuser . .

CMD ["python", "main.py"]
