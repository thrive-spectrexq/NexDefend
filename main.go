package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/ai"
	"github.com/thrive-spectrexq/NexDefend/internal/auth"
	"github.com/thrive-spectrexq/NexDefend/internal/compliance"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/incident"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/osquery"
	"github.com/thrive-spectrexq/NexDefend/internal/threat"
	"github.com/thrive-spectrexq/NexDefend/internal/trivy"
	"github.com/thrive-spectrexq/NexDefend/internal/upload"
	"github.com/thrive-spectrexq/NexDefend/internal/vulnerability"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

var (
	API_PREFIX = "/api/v1" // Prefix for API versioning
)

func main() {
	logging.InitLogging()
	database := db.InitDB()
	defer db.CloseDB()

	if err := startOsqueryDaemon(); err != nil {
		log.Fatalf("failed to start osquery daemon: %v", err)
	}
	time.Sleep(2 * time.Second)

	// Start Suricata threat detection with the database as EventStore
	go threat.StartThreatDetection(database)

	router := mux.NewRouter()
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)

	// Authentication Routes
	router.HandleFunc("/register", auth.RegisterHandler).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler).Methods("POST")

	// API Routes
	api := router.PathPrefix(API_PREFIX).Subrouter()
	api.Use(auth.JWTMiddleware)

	api.HandleFunc("/threats", ai.ThreatDetectionHandler).Methods("POST")
	api.HandleFunc("/incident-report", incident.ReportHandler).Methods("POST")
	api.HandleFunc("/vulnerability-scan", vulnerability.ScanHandler).Methods("POST")
	api.HandleFunc("/ioc-scan", osquery.IOCScanHandler).Methods("GET")
	api.HandleFunc("/audit", compliance.AuditHandler).Methods("GET")
	api.HandleFunc("/threats", threat.ThreatsHandler).Methods("GET")
	api.HandleFunc("/alerts", threat.AlertsHandler).Methods("GET")
	api.HandleFunc("/upload", upload.UploadFileHandler).Methods("POST")
	api.HandleFunc("/trivy-scan", TrivyScanHandler).Methods("POST")

	// Home Endpoint
	router.HandleFunc("/", HomeHandler).Methods("GET")

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

// TrivyScanHandler handles requests for Trivy scans
func TrivyScanHandler(w http.ResponseWriter, r *http.Request) {
	var req trivy.ScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	result, err := trivy.RunScan(req)
	if err != nil {
		http.Error(w, fmt.Sprintf("Trivy scan failed: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func startOsqueryDaemon() error {
	cmd := exec.Command("osqueryd", "--disable_events=false", "--disable_logging=false", "--extensions_socket=/var/osquery/shell.em")
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
