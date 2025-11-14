# Build stage
FROM golang:1.24.3-alpine AS builder

# Install C build tools and librdkafka development headers
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./

# Run tidy once to get most dependencies (good for caching)
RUN go mod tidy

# Copy ALL source code
COPY . .

# --- 1. ADD THIS LINE ---
# Run tidy AGAIN to find dependencies in the source code (like azeventhubs)
# and add them to go.sum before building.
RUN go mod tidy

# Build the application
RUN go build -tags "libkafka musl" -o /nexdefend-cloud-connector .

# Final stage
FROM alpine:latest

# Install the runtime C library
RUN apk add --no-cache librdkafka

WORKDIR /

COPY --from=builder /nexdefend-cloud-connector /nexdefend-cloud-connector

EXPOSE 8081

CMD ["/nexdefend-cloud-connector"]
