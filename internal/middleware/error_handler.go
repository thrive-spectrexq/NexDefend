package middleware

import (
    "encoding/json"
    "log"
    "net/http"
)

// ErrorResponse represents the structure of the error response
type ErrorResponse struct {
    Message string `json:"message"`
}

// ErrorHandler middleware to catch errors and respond with a formatted message
func ErrorHandler(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        defer func() {
            if err := recover(); err != nil {
                log.Printf("Recovered from panic: %v, Request: %s %s", err, r.Method, r.URL.Path)
                w.Header().Set("Content-Type", "application/json")
                w.WriteHeader(http.StatusInternalServerError)
                json.NewEncoder(w).Encode(ErrorResponse{Message: "Internal Server Error"})
            }
        }()
        next.ServeHTTP(w, r)
    })
}