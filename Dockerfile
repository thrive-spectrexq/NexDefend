# Stage 1: Builder
FROM golang:1.24.3-alpine AS builder

# Install build dependencies for CGO (required for confluent-kafka-go)
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build the binary with tags for Alpine (musl)
# Using CGO_ENABLED=1 because confluent-kafka-go requires it
RUN CGO_ENABLED=1 GOOS=linux go build -tags musl -o /nexdefend main.go

# Stage 2: Runtime
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache librdkafka

# Create a non-root user
RUN adduser -D -g '' appuser

WORKDIR /

# Copy the binary from the builder stage
COPY --from=builder /nexdefend /nexdefend

# Use non-root user
USER appuser

EXPOSE 8080

CMD ["/nexdefend"]
