# Build stage
FROM golang:1.24.3-alpine AS builder

# Install C build tools and librdkafka development headers
RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./

# Run tidy once to get most dependencies (good for caching)
RUN go mod download

# Copy ALL source code
COPY . .

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
