FROM python:3.11-slim

WORKDIR /app

# Install nmap and clean up
RUN apt-get update && \
    apt-get install -y nmap && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m appuser

COPY ./requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY ./ ./

# Change ownership of the app directory
RUN chown -R appuser:appuser /app

USER appuser

CMD ["./start.sh"]
