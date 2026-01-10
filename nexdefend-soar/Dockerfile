# Stage 1: Builder
FROM golang:1.24.3-alpine AS builder

RUN apk add --no-cache gcc musl-dev librdkafka-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build with correct tags
RUN CGO_ENABLED=1 GOOS=linux go build -tags "libkafka musl" -o /nexdefend-soar

# Stage 2: Runtime
FROM alpine:latest

RUN apk add --no-cache librdkafka

RUN adduser -D -g '' appuser

WORKDIR /

COPY --from=builder /nexdefend-soar /nexdefend-soar

USER appuser

# Matches the port defined in main.go (8080)
EXPOSE 8080 

CMD ["/nexdefend-soar"]
