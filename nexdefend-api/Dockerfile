FROM golang:1.23.2-alpine3.19@sha256:f6392ffebb028fed5ffe743ddb9716e38402c978779edd66474bb5d05f5e65e4 AS builder

WORKDIR /app
COPY ./go.mod ./go.sum ./
RUN go mod download

COPY ./ ./

# Build the Go application
RUN go build -o nexdefend-api .

# Command to run the application
CMD ["/app/nexdefend-api"]
