# Build stage
# Assumes you are using a Go 1.24+ alpine image
FROM golang:1.24.3-alpine AS builder

# 1. ADD THIS LINE to install C build tools and librdkafka-dev
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# 2. MODIFY THIS LINE: Remove CGO_ENABLED=0
# Old: RUN CGO_ENABLED=0 GOOS=linux go build -o /nexdefend-soar
# New:
RUN GOOS=linux go build -tags libkafka -o /nexdefend-soar

# Final stage
FROM alpine:latest

# 3. ADD THIS LINE to install the runtime library
RUN apk add --no-cache librdkafka

WORKDIR /

COPY --from=builder /nexdefend-soar /nexdefend-soar

# Assuming it has an EXPOSE and CMD line, leave them as-is
# EXPOSE 8082 
CMD ["/nexdefend-soar"]
