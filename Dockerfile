# --- Stage 1: Build Go Backend ---
FROM golang:1.24.3-alpine AS builder

# Install build dependencies (CGO needed for SQLite & Kafka)
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

# Copy Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy Source
COPY . .

# Build Go Binary (CGO_ENABLED=1 for SQLite)
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /nexdefend main.go

# --- Stage 2: Final Monolith Runtime ---
FROM python:3.11-alpine

# Install Runtime Dependencies
# librdkafka (Go), sqlite (DB), bash/curl (Scripts)
RUN apk add --no-cache librdkafka sqlite ca-certificates bash curl gcc musl-dev python3-dev libffi-dev

# 1. Setup ZincSearch (Lightweight Search Engine)
WORKDIR /zinc
RUN curl -L https://github.com/zincsearch/zincsearch/releases/download/v0.4.9/zincsearch_0.4.9_Linux_x86_64.tar.gz | tar xz
RUN mv zincsearch /usr/local/bin/zincsearch

# 2. Setup Python AI Service
WORKDIR /app/nexdefend-ai
COPY nexdefend-ai/requirements.txt .
# Remove psycopg2 if present, ensure requirements work for Alpine
RUN pip install --no-cache-dir -r requirements.txt

COPY nexdefend-ai/ .

# 3. Setup Go Backend
WORKDIR /app
COPY --from=builder /nexdefend /nexdefend

# Create persistent data directories
RUN mkdir -p /data/zinc

# Environment Configuration
ENV DB_PATH=/data/nexdefend.db
ENV ZINC_DATA_PATH=/data/zinc
ENV ZINC_FIRST_ADMIN_USER=admin
ENV ZINC_FIRST_ADMIN_PASSWORD=Complexpass#123
ENV OPENSEARCH_ADDR=http://admin:Complexpass#123@localhost:4080
ENV PYTHON_API=http://localhost:5000
ENV PORT=8080

# Expose ports: 8080 (Go API), 5000 (Python), 4080 (Zinc)
EXPOSE 8080 5000 4080

# Copy startup script
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
