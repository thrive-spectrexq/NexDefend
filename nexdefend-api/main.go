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

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	logging.InitLogging()
	db.InitDB()
	defer db.CloseDB()

	router := mux.NewRouter()
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)

	// API Endpoints
	router.HandleFunc("/", HomeHandler).Methods("GET")
	router.Handle("/api/v1/threats", auth.JWTMiddleware(http.HandlerFunc(ai.ThreatDetectionHandler))).Methods("POST")
	router.HandleFunc("/api/v1/alerts", AlertsHandler).Methods("GET")
	router.HandleFunc("/api/v1/vulnerability-scan", vulnerability.ScanHandler).Methods("POST")
	router.HandleFunc("/api/v1/audit", compliance.AuditHandler).Methods("GET")
	router.HandleFunc("/api/v1/incident-report", incident.ReportHandler).Methods("POST")
	router.HandleFunc("/api/v1/upload", upload.UploadFileHandler).Methods("POST")
	router.HandleFunc("/register", auth.RegisterHandler).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler).Methods("POST")

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

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	log.Println("Shutting down the server...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exiting")
}

// AlertsHandler handles alert requests
func AlertsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// Simulate sending a simple alert message as JSON response
	response := map[string]string{"alert": "Sample alert from NexDefend"}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}

// HomeHandler handles the home route
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to NexDefend API!")
}
