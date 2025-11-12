# --- FIX: Update Go version from 1.21 to 1.24.3 to match go.mod ---
FROM golang:1.24.3

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /nexdefend cmd/nexdefend/main.go

EXPOSE 8080

CMD ["/nexdefend"]
