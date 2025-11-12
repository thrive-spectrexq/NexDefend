# Use the correct Go version
FROM golang:1.24.3

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# --- FIX: Changed the build path ---
# From: cmd/nexdefend/main.go
# To:   main.go
RUN go build -o /nexdefend main.go

EXPOSE 8080

CMD ["/nexdefend"]
