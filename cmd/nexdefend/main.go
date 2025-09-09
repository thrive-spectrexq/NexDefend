package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/ai"
	"github.com/thrive-spectrexq/NexDefend/internal/auth"
	"github.com/thrive-spectrexq/NexDefend/internal/compliance"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/incident"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
	"github.com/thrive-spectrexq/NexDefend/internal/threat"
	"github.com/thrive-spectrexq/NexDefend/internal/upload"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

var (
	API_PREFIX           string // Prefix for API versioning
	PYTHON_API           string // Python API Base URL
	CORS_ALLOWED_ORIGINS []string
	PYTHON_ROUTES        = map[string]string{
		"analysis":  "/analysis",
		"anomalies": "/anomalies",
	}
)

func init() {
	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found. Using system environment variables.")
	}

	API_PREFIX = os.Getenv("API_PREFIX")
	if API_PREFIX == "" {
		API_PREFIX = "/api/v1"
	}

	PYTHON_API = os.Getenv("PYTHON_API")
	if PYTHON_API == "" {
		PYTHON_API = "https://nexdefend-1.onrender.com"
	}

	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins == "" {
		CORS_ALLOWED_ORIGINS = []string{"https://nexdefend.vercel.app"}
	} else {
		CORS_ALLOWED_ORIGINS = strings.Split(corsOrigins, ",")
	}
}

func main() {
	logging.InitLogging()
	database := db.InitDB()
	defer db.CloseDB()

	// Start Suricata threat detection with the database as EventStore
	go threat.StartThreatDetection(database)

	// Start collecting system metrics
	go metrics.CollectMetrics(database)

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
	api.HandleFunc("/audit", compliance.AuditHandler).Methods("GET")
	api.HandleFunc("/threats", threat.ThreatsHandler(database.GetDB())).Methods("GET")
	api.HandleFunc("/alerts", threat.AlertsHandler).Methods("GET")
	api.HandleFunc("/upload", upload.UploadFileHandler).Methods("POST")

	// Add handlers to query Python API
	api.HandleFunc("/python-analysis", PythonAnalysisHandler).Methods("GET")
	api.HandleFunc("/python-anomalies", PythonAnomaliesHandler).Methods("GET")

	// Metrics Endpoint
	api.HandleFunc("/metrics", MetricsHandler(database)).Methods("GET")

	// Home Endpoint
	router.HandleFunc("/", HomeHandler).Methods("GET")

	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   CORS_ALLOWED_ORIGINS,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	// Apply CORS middleware
	router.Use(corsOptions.Handler)

	srv := &http.Server{
		Addr:    ":8080",
		Handler: router,
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

// PythonAnalysisHandler fetches analysis results from the Python API
func PythonAnalysisHandler(w http.ResponseWriter, r *http.Request) {
	results := fetchPythonResults(PYTHON_ROUTES["analysis"])
	if results == nil {
		http.Error(w, "Failed to fetch analysis results", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// PythonAnomaliesHandler fetches anomaly results from the Python API
func PythonAnomaliesHandler(w http.ResponseWriter, r *http.Request) {
	results := fetchPythonResults(PYTHON_ROUTES["anomalies"])
	if results == nil {
		http.Error(w, "Failed to fetch anomaly results", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

// fetchPythonResults queries the Python API for specific endpoint results
func fetchPythonResults(endpoint string) map[string]interface{} {
	resp, err := http.Get(PYTHON_API + endpoint)
	if err != nil {
		log.Printf("Error fetching Python API results (%s): %v", endpoint, err)
		return nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading Python API response (%s): %v", endpoint, err)
		return nil
	}

	var results map[string]interface{}
	if err := json.Unmarshal(body, &results); err != nil {
		log.Printf("Error unmarshaling Python API response (%s): %v", endpoint, err)
		return nil
	}

	return results
}

// gracefulShutdown handles graceful server shutdown on interrupt signals
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

// HomeHandler handles the home route
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "success", "message": "Welcome to NexDefend API!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// MetricsHandler handles requests for system metrics
func MetricsHandler(store metrics.MetricStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		metricType := r.URL.Query().Get("type")
		if metricType == "" {
			http.Error(w, "Missing 'type' query parameter", http.StatusBadRequest)
			return
		}

		fromStr := r.URL.Query().Get("from")
		toStr := r.URL.Query().Get("to")

		from, err := time.Parse(time.RFC3339, fromStr)
		if err != nil {
			from = time.Now().Add(-1 * time.Hour) // Default to last hour
		}

		to, err := time.Parse(time.RFC3339, toStr)
		if err != nil {
			to = time.Now()
		}

		results, err := store.GetSystemMetrics(metricType, from, to)
		if err != nil {
			http.Error(w, "Failed to fetch system metrics", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}
