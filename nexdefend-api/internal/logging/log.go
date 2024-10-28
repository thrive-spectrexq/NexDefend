package logging

import (
	"log"
	"net/http"
	"os"
	"time"
)

// Initialize a logger for both requests and errors
var (
	infoLog  *log.Logger
	errorLog *log.Logger
)

// InitLogging sets up the loggers to log to a file
func InitLogging() {
	file, err := os.OpenFile("nexdefend.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatal("Failed to open log file:", err)
	}

	infoLog = log.New(file, "INFO\t", log.Ldate|log.Ltime)
	errorLog = log.New(file, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)
}

// LogRequest logs incoming HTTP requests
func LogRequest(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		infoLog.Printf("Method: %s, URL: %s, RemoteAddr: %s, Duration: %s", r.Method, r.URL.Path, r.RemoteAddr, time.Since(start))
	})
}

// LogError logs any errors encountered
func LogError(err error) {
	if err != nil {
		errorLog.Println(err)
	}
}
