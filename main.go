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
	"NexDefend/internal/threat"
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
	API_PREFIX = "/api/v1" // Prefix for API versioning
)

func main() {
	logging.InitLogging()
	db.InitDB()
	defer db.CloseDB()

	if err := startOsqueryDaemon(); err != nil {
		log.Fatalf("failed to start osquery daemon: %v", err)
	}
	time.Sleep(2 * time.Second)

	// Start Suricata threat detection
	go threat.StartThreatDetection()

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
	api.HandleFunc("/alerts", AlertsHandler).Methods("GET")
	api.HandleFunc("/upload", upload.UploadFileHandler).Methods("POST")

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
