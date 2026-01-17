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

# 2. Build SOAR Binary (FIXED)
WORKDIR /app/nexdefend-soar
# FIX: Run go mod tidy to ensure dependencies are synced before building
RUN go mod tidy
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /nexdefend-soar-bin main.go

# --- Stage 2: Final Monolith Image ---
FROM python:3.11-alpine

# Install Runtime Dependencies
# We include 'g++' and 'openblas-dev' for scikit-learn
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
    openblas-dev \
    iptables

# 1. Setup ZincSearch
WORKDIR /zinc
RUN curl -L https://github.com/zincsearch/zincsearch/releases/download/v0.4.9/zincsearch_0.4.9_Linux_x86_64.tar.gz | tar xz
RUN mv zincsearch /usr/local/bin/zincsearch

# 2. Setup Python AI
WORKDIR /app/nexdefend-ai
COPY nexdefend-ai/requirements.txt .

# FIX: Remove 'confluent-kafka' for Render Demo Build
# This prevents the build error. For Enterprise mode, we would use a Debian-based image.
RUN sed -i '/psycopg2-binary/d' requirements.txt && \
    sed -i '/confluent-kafka/d' requirements.txt && \
    pip install --no-cache-dir --prefer-binary -r requirements.txt

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

CMD ["/start.sh"]
