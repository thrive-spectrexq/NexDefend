# Build stage
FROM golang:1.24.3-alpine AS builder

# --- 1. ADD THIS LINE ---
# Install C build tools and librdkafka development headers
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# --- 2. MODIFY THIS LINE ---
# Add the 'libkafka musl' tags to build against the system library
RUN go build -tags "libkafka musl" -o /nexdefend-cloud-connector .

# Final stage
FROM alpine:latest

# --- 3. ADD THIS LINE ---
# Install the runtime C library
RUN apk add --no-cache librdkafka

WORKDIR /

COPY --from=builder /nexdefend-cloud-connector /nexdefend-cloud-connector

EXPOSE 8081

CMD ["/nexdefend-cloud-connector"]
