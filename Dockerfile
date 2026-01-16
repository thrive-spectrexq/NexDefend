# --- Stage 1: Build Go Backend ---
FROM golang:1.24.3-alpine AS builder

# Install build dependencies
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

# Copy Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy Source
COPY . .

# Build Go Binary
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /nexdefend main.go

# --- Stage 2: Final Monolith Image ---
FROM python:3.11-alpine

# Install Runtime Dependencies
RUN apk add --no-cache \
    librdkafka \
    librdkafka-dev \
    sqlite \
    ca-certificates \
    bash \
    curl \
    gcc \
    g++ \
    musl-dev \
    python3-dev \
    libffi-dev \
    nmap \
    openblas-dev

# 1. Setup ZincSearch
WORKDIR /zinc
RUN curl -L https://github.com/zincsearch/zincsearch/releases/download/v0.4.9/zincsearch_0.4.9_Linux_x86_64.tar.gz | tar xz
RUN mv zincsearch /usr/local/bin/zincsearch

# 2. Setup Python AI
WORKDIR /app/nexdefend-ai
COPY nexdefend-ai/requirements.txt .

# Remove conflicting dependencies
RUN sed -i '/psycopg2-binary/d' requirements.txt && \
    sed -i '/confluent-kafka/d' requirements.txt && \
    pip install --no-cache-dir --prefer-binary -r requirements.txt

COPY nexdefend-ai/ .

# 3. Setup Go Backend
WORKDIR /app
COPY --from=builder /nexdefend /nexdefend
COPY database/init.sql /app/database/init.sql

# Create persistent data directories
RUN mkdir -p /data/zinc

# --- CONFIGURATION FIX ---
ENV DB_PATH=/data/nexdefend.db
ENV ZINC_DATA_PATH=/data/zinc

# FIX: Changed password to remove '#' which breaks the URL parser
ENV ZINC_FIRST_ADMIN_USER=admin
ENV ZINC_FIRST_ADMIN_PASSWORD=Complexpass123

# FIX: Updated connection string to match new password
ENV OPENSEARCH_ADDR=http://admin:Complexpass123@localhost:4080

ENV PYTHON_API=http://localhost:5000
ENV PORT=8080

EXPOSE 8080 5000 4080

COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
