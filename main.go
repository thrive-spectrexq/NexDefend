package main

import (
	"NexDefend/internal/ai"
	"NexDefend/internal/auth"
	"NexDefend/internal/compliance"
	"NexDefend/internal/db"
	"NexDefend/internal/incident"
	"NexDefend/internal/logging"
	"NexDefend/internal/middleware"
	"NexDefend/internal/osquery"
	"NexDefend/internal/upload"
	"NexDefend/internal/vulnerability"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var (
	osqueryAddress = "localhost:9000"
)

func main() {
	logging.InitLogging()
	db.InitDB()
	defer db.CloseDB()

	// Verify osqueryi installation
	if err := verifyOsqueryInstallation(); err != nil {
		log.Fatalf("osquery verification failed: %v", err)
	}

	// Start osquery daemon if not already running
	if err := startOsqueryDaemon(); err != nil {
		log.Fatalf("failed to start osquery daemon: %v", err)
	}

	router := mux.NewRouter()
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)

	// === Authentication Routes ===
	router.HandleFunc("/register", auth.RegisterHandler).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler).Methods("POST")

	// === API Version 1 Routes ===
	api := router.PathPrefix("/api/v1").Subrouter()
	api.Use(auth.JWTMiddleware)

	// Threat Detection & Incident Management
	api.HandleFunc("/threats", ai.ThreatDetectionHandler).Methods("POST")
	api.HandleFunc("/incident-report", incident.ReportHandler).Methods("POST")

	// Vulnerability & IOC Scanning
	api.HandleFunc("/vulnerability-scan", vulnerability.ScanHandler).Methods("POST")
	api.HandleFunc("/ioc-scan", IOCScanHandler).Methods("GET")

	// Compliance & Audits
	api.HandleFunc("/audit", compliance.AuditHandler).Methods("GET")

	// Alerts & File Upload
	api.HandleFunc("/alerts", AlertsHandler).Methods("GET")
	api.HandleFunc("/upload", upload.UploadFileHandler).Methods("POST")

	// === Home Endpoint ===
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

	go func() {
		fmt.Println("Starting NexDefend API server on port 8080...")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	gracefulShutdown(srv)
	log.Println("Server exited gracefully")
}

func verifyOsqueryInstallation() error {
	cmd := exec.Command("osqueryi", "--json", "SELECT name, pid FROM processes LIMIT 1;")
	if output, err := cmd.CombinedOutput(); err != nil {
		log.Printf("osquery installation verification failed: %s", output)
		return fmt.Errorf("osquery not found or not functioning: %v", err)
	}
	log.Println("osquery installation verified successfully")
	return nil
}

func startOsqueryDaemon() error {
	cmd := exec.Command("osqueryd", "--disable_events=false", "--disable_logging=false", "--extensions_socket=/var/osquery/osquery.em")
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start osquery daemon: %v", err)
	}
	log.Println("osquery daemon started successfully")
	return nil
}

func gracefulShutdown(srv *http.Server) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down the server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
}

func jsonErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "error",
		"message": message,
	})
}

// isValidIOCName validates the IOC name based on predefined criteria
func isValidIOCName(name string) bool {
	if len(name) == 0 {
		return false
	}
	for _, char := range name {
		if !(char >= 'A' && char <= 'Z' || char >= 'a' && char <= 'z' || char >= '0' && char <= '9' || char == '_') {
			return false
		}
	}
	return true
}

// IOCScanHandler scans for IOCs using osquery
func IOCScanHandler(w http.ResponseWriter, r *http.Request) {
	client, err := osquery.NewClient(osqueryAddress, 5*time.Second)
	if err != nil {
		log.Println("Error creating osquery client:", err)
		jsonErrorResponse(w, "Failed to connect to osquery", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	// Test connection by pinging
	if _, pingErr := client.Ping(); pingErr != nil {
		log.Println("Error pinging osquery:", pingErr)
		jsonErrorResponse(w, "Failed to connect to osquery", http.StatusInternalServerError)
		return
	}

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
