# Use the official Golang image
FROM golang:1.16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files for the build
COPY nexdefend-api/go.mod nexdefend-api/go.sum ./
RUN go mod download

# Copy the rest of the application files
COPY nexdefend-api/ ./

# Build the Go application
RUN go build -o nexdefend-api .

# Command to run the application
CMD ["/app/nexdefend-api"]
