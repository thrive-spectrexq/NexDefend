
# Build stage
FROM golang:1.24.3-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /nexdefend-cloud-connector .

# Final stage
FROM alpine:latest

WORKDIR /

COPY --from=builder /nexdefend-cloud-connector /nexdefend-cloud-connector

EXPOSE 8081

CMD ["/nexdefend-cloud-connector"]
