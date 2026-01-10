# Stage 1: Builder
FROM golang:1.24.3-alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc musl-dev libpcap-dev librdkafka-dev

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=1 GOOS=linux go build -tags "libkafka musl" -o /nexdefend-agent

# Stage 2: Runtime
FROM alpine:latest

# Install runtime dependencies including Osquery
RUN apk add --no-cache wget tar libpcap librdkafka && \
    wget https://github.com/osquery/osquery/releases/download/5.11.0/osquery-5.11.0_1.linux_x86_64.tar.gz && \
    tar -xzf osquery-5.11.0_1.linux_x86_64.tar.gz && \
    find . -name osqueryd -exec mv {} /usr/bin/osqueryd \; && \
    chmod +x /usr/bin/osqueryd && \
    rm osquery-5.11.0_1.linux_x86_64.tar.gz

# Create user
RUN adduser -D -g '' appuser

COPY --from=builder /nexdefend-agent /nexdefend-agent

# NOTE: If osqueryd needs to access system logs/processes, you may need to run as root.
# Uncomment the next line only if strict security is required and tested:
# USER appuser

CMD ["/bin/sh", "-c", "/usr/bin/osqueryd & /nexdefend-agent"]
