# --- Stage 1: Build Go Binaries ---
FROM golang:1.24.3-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

# Copy Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy Source
COPY . .

# 1. Build Core API
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /nexdefend main.go

# 2. Build SOAR Binary
WORKDIR /app/nexdefend-soar
RUN go mod tidy
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /nexdefend-soar-bin main.go

# --- Stage 2: Final Monolith Image ---
FROM python:3.11-slim

# Install Runtime Dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    librdkafka1 \
    librdkafka-dev \
    sqlite3 \
    ca-certificates \
    curl \
    gcc \
    g++ \
    libpq-dev \
    nmap \
    python3-dev \
    libffi-dev \
    iptables \
    && rm -rf /var/lib/apt/lists/*

# 1. Setup ZincSearch
WORKDIR /zinc
RUN curl -L https://github.com/zincsearch/zincsearch/releases/download/v0.4.9/zincsearch_0.4.9_Linux_x86_64.tar.gz | tar xz
RUN mv zincsearch /usr/local/bin/zincsearch

# 2. Setup Python AI
WORKDIR /app/nexdefend-ai
COPY nexdefend-ai/requirements.txt .

# Install dependencies including psycopg2 and confluent-kafka
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

COPY nexdefend-ai/ .

# 3. Setup Go Backend & SOAR
WORKDIR /app
COPY --from=builder /nexdefend /nexdefend
COPY --from=builder /nexdefend-soar-bin /nexdefend-soar-bin
COPY database/init.sql /app/database/init.sql

# Create persistent data directories
RUN mkdir -p /data/zinc

# Config
ENV DB_PATH=/data/nexdefend.db
ENV ZINC_DATA_PATH=/data/zinc
ENV ZINC_FIRST_ADMIN_USER=admin
ENV ZINC_FIRST_ADMIN_PASSWORD=Complexpass123
ENV OPENSEARCH_ADDR=http://admin:Complexpass123@localhost:4080
ENV PYTHON_API=http://localhost:5000
ENV SOAR_URL=http://localhost:8081
ENV PORT=8080

EXPOSE 8080 5000 4080 8081

COPY start.sh /start.sh
RUN chmod +x /start.sh

# Create non-root user
RUN useradd -m nexdefend
RUN chown -R nexdefend:nexdefend /app /data /zinc
USER nexdefend

CMD ["/start.sh"]
