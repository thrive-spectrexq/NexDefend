# Use the official Golang image to create a build artifact.
FROM golang:1.24.3 as builder

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies.
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code.
COPY . .

# Build the application.
RUN CGO_ENABLED=0 GOOS=linux go build -o /nexdefend-soar

# Use a minimal image for the final stage.
FROM alpine:latest

# Copy the binary from the builder stage.
COPY --from=builder /nexdefend-soar /nexdefend-soar

# Set the command to run the application.
CMD ["/nexdefend-soar"]
