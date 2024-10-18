package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"nexdefend-api/internal/auth"
	"nexdefend-api/internal/db"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize the database connection
	db.InitDB()
	defer db.CloseDB() // Ensure the database connection is closed at the end

	router := mux.NewRouter()

	// API Endpoints
	router.HandleFunc("/", HomeHandler).Methods("GET")
	router.Handle("/api/v1/threats", auth.JWTMiddleware(http.HandlerFunc(ThreatDetectionHandler))).Methods("POST")
	router.HandleFunc("/api/v1/alerts", AlertsHandler).Methods("GET")

	// Create a new HTTP server
	srv := &http.Server{
		Addr:    ":8080", // You can replace this with a configurable port
		Handler: router,
	}

	// Run the server in a goroutine
	go func() {
		fmt.Println("Starting NexDefend API server on port 8080...")
		if err := srv.ListenAndServe(); err != nil {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown handling
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

func HomeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to NexDefend API!")
}

func ThreatDetectionHandler(w http.ResponseWriter, r *http.Request) {
	// Simulate some threat detection logic
	if err := performThreatDetection(); err != nil {
		http.Error(w, "Failed to detect threat", http.StatusInternalServerError)
		log.Printf("Error during threat detection: %v", err)
		return
	}
	fmt.Fprintf(w, "Threat detected! Running analysis...")
}

// Dummy function for demonstration
func performThreatDetection() error {
	// Your threat detection logic here
	return nil // or return an error if something goes wrong
}

func AlertsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	for {
		// Simulate sending threat alerts every few seconds
		fmt.Fprintf(w, "data: %s\n\n", "Threat detected in system X")
		w.(http.Flusher).Flush()
		time.Sleep(5 * time.Second)
	}
}
