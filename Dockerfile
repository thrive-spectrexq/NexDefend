FROM golang:1.23.2-alpine3.19@sha256:f6392ffebb028fed5ffe743ddb9716e38402c978779edd66474bb5d05f5e65e4 AS builder

# Set the working directory to the root directory of the application
WORKDIR /app

# Copy the Go module files
COPY ./go.mod ./go.sum ./

# Download dependencies
RUN go mod download

# Copy the entire application to the working directory
COPY ./ ./

# Build the Go application
RUN go build -o NexDefend .

# Command to run the application
CMD ["/app/NexDefend"]
