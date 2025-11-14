
# Use the official Golang image to create a build artifact.
FROM golang:1.19 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies.
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code.
COPY . .

# Build the application.
RUN CGO_ENABLED=0 GOOS=linux go build -o /nexdefend-agent

# Use a minimal image for the final stage.
FROM alpine:latest

# Install Osquery.
RUN apk add --no-cache wget tar && \
    wget https://github.com/osquery/osquery/releases/download/5.11.0/osquery-5.11.0_1.linux_x86_64.tar.gz && \
    tar -xzf osquery-5.11.0_1.linux_x86_64.tar.gz && \
    mv osquery-5.11.0_1.linux_x86_64/usr/bin/osqueryd /usr/bin/osqueryd && \
    mv osquery-5.11.0_1.linux_x86_64/usr/bin/osqueryi /usr/bin/osqueryi && \
    chmod +x /usr/bin/osqueryd && \
    chmod +x /usr/bin/osqueryi

# Copy the binary from the builder stage.
COPY --from=builder /nexdefend-agent /nexdefend-agent

# Set the command to run the application.
CMD ["/bin/sh", "-c", "/usr/bin/osqueryd & /nexdefend-agent"]
