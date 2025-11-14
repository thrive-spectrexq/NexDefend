# Use the official Golang image to create a build artifact.
FROM golang:1.24.3 as builder

# Set the working directory inside the container
WORKDIR /app

# <--- ADDED ---
# Install C build tools, libpcap, and librdkafka development headers
# These are required for gopacket and confluent-kafka-go
RUN apk add --no-cache gcc musl-dev libpcap-dev librdkafka-dev

# Copy the Go module files and download dependencies.
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code.
COPY . .

# Build the application.
# <--- CHANGED ---
# Removed CGO_ENABLED=0 to allow C dependencies to build
RUN GOOS=linux go build -o /nexdefend-agent

# Use a minimal image for the final stage.
FROM alpine:latest

# Install Osquery and runtime C libraries.
# <--- CHANGED ---
# Added runtime libraries libpcap and librdkafka
RUN apk add --no-cache wget tar libpcap librdkafka && \
    wget https://github.com/osquery/osquery/releases/download/5.11.0/osquery-5.11.0_1.linux_x86_64.tar.gz && \
    tar -xzf osquery-5.11.0_1.linux_x86_64.tar.gz && \
    find . -name osqueryd -exec mv {} /usr/bin/osqueryd \; && \
    chmod +x /usr/bin/osqueryd

# Copy the binary from the builder stage.
COPY --from=builder /nexdefend-agent /nexdefend-agent

# Set the command to run the application.
CMD ["/bin/sh", "-c", "/usr/bin/osqueryd & /nexdefend-agent"]
