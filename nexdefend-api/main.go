package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"nexdefend-api/internal/ai"
	"nexdefend-api/internal/auth"
	"nexdefend-api/internal/compliance"
	"nexdefend-api/internal/db"
	"nexdefend-api/internal/incident"
	"nexdefend-api/internal/logging"
	"nexdefend-api/internal/middleware"
	"nexdefend-api/internal/upload"
	"nexdefend-api/internal/vulnerability"
	"os"
	"os/signal"
	"time"
	"unicode"

	"github.com/gorilla/mux"
	"github.com/osquery/osquery-go"
	"github.com/rs/cors"
)

func main() {
	logging.InitLogging()
	db.InitDB()
	defer db.CloseDB()

	router := mux.NewRouter()
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)

	// Auth Endpoints
	router.HandleFunc("/register", auth.RegisterHandler).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler).Methods("POST")

	// Threat Detection & Incident Management
	router.Handle("/api/v1/threats", auth.JWTMiddleware(http.HandlerFunc(ai.ThreatDetectionHandler))).Methods("POST")
	router.HandleFunc("/api/v1/incident-report", incident.ReportHandler).Methods("POST")

	// Vulnerability & IOC Scanning
	router.HandleFunc("/api/v1/vulnerability-scan", vulnerability.ScanHandler).Methods("POST")
	router.HandleFunc("/api/v1/ioc-scan", IOCScanHandler).Methods("GET")

	// Compliance & Audits
	router.HandleFunc("/api/v1/audit", compliance.AuditHandler).Methods("GET")

	// Alerts & File Upload
	router.HandleFunc("/api/v1/alerts", AlertsHandler).Methods("GET")
	router.HandleFunc("/api/v1/upload", upload.UploadFileHandler).Methods("POST")

	// Home Endpoint
	router.HandleFunc("/", HomeHandler).Methods("GET")

	// Configure CORS
	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	srv := &http.Server{
		Addr:    ":8080",
		Handler: corsOptions.Handler(router),
	}

	// Start server
	go func() {
		fmt.Println("Starting NexDefend API server on port 8080...")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down the server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited gracefully")
}

// jsonErrorResponse sends a formatted JSON error response
func jsonErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "error",
		"message": message,
	})
}

// createOsqueryClient creates an osquery client with a preconfigured timeout
func createOsqueryClient() (*osquery.ExtensionManagerClient, error) {
	return osquery.NewClient("localhost:9000", 5*time.Second)
}

// isValidIOCName validates the IOC name to prevent injection or invalid input
func isValidIOCName(name string) bool {
	for _, r := range name {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) {
			return false
		}
	}
	return true
}

// IOCScanHandler scans for IOCs using osquery
func IOCScanHandler(w http.ResponseWriter, r *http.Request) {
	client, err := createOsqueryClient()
	if err != nil {
		log.Println("Error connecting to osquery:", err)
		jsonErrorResponse(w, "Failed to connect to osquery", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	// Retrieve IOC name from query parameters, default to a common IOC
	iocName := r.URL.Query().Get("name")
	if iocName == "" || !isValidIOCName(iocName) {
		iocName = "suspicious_process_name"
	}
	query := fmt.Sprintf("SELECT name, pid, path, parent, uid FROM processes WHERE name = '%s'", iocName)

	// Execute query
	resp, err := client.Query(query)
	if err != nil {
		log.Println("Error in osquery query:", err)
		jsonErrorResponse(w, "Query failed", http.StatusInternalServerError)
		return
	}

	// Encode and return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"ioc":     iocName,
		"results": resp.Response,
	})
}

// AlertsHandler handles alert requests
func AlertsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"status": "success", "alert": "Sample alert from NexDefend"}
	json.NewEncoder(w).Encode(response)
}

// HomeHandler handles the home route
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "success", "message": "Welcome to NexDefend API!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
