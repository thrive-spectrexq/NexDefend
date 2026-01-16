package main

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/cors" // FIX: Import rs/cors
	"github.com/thrive-spectrexq/NexDefend/internal/cache"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/correlation"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/enrichment"
	"github.com/thrive-spectrexq/NexDefend/internal/handlers"
	"github.com/thrive-spectrexq/NexDefend/internal/ingestor"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"github.com/thrive-spectrexq/NexDefend/internal/ndr"
	"github.com/thrive-spectrexq/NexDefend/internal/routes"
	"github.com/thrive-spectrexq/NexDefend/internal/search"
	"github.com/thrive-spectrexq/NexDefend/internal/telemetry"
	"github.com/thrive-spectrexq/NexDefend/internal/tip"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
)

func main() {
	cfg := config.LoadConfig()

	// 1. Initialize Telemetry
	tp, err := telemetry.InitTracerProvider()
	if err != nil {
		log.Printf("Warning: Failed to init tracer: %v", err)
	} else {
		defer func() {
			if err := tp.Shutdown(context.Background()); err != nil {
				log.Printf("Error shutting down tracer provider: %v", err)
			}
		}()
	}

	logging.InitLogging()

	// 2. Initialize SQLite Database
	database := db.InitDB()
	defer db.CloseDB()

	// 3. Setup Internal Event Channel
	internalEvents := make(chan models.CommonEvent, 1000)

	// 4. Start Core Engines
	correlationEngine := correlation.NewCorrelationEngine()
	
	// Start Ingestor
	go ingestor.StartIngestor(correlationEngine, internalEvents, database.GetDB())
	
	// Start System Metrics Collection
	go metrics.CollectMetrics(database)
	
	// Start Agent Collector
	go handlers.StartActiveAgentCollector(database.GetDB())

	// 5. Collectors / Demo Mode
	if os.Getenv("DEMO_MODE") == "true" {
		log.Println("--- DEMO MODE ENABLED: Generating simulated traffic ---")
		go startDemoTrafficGenerator(internalEvents)
	} else {
		if os.Getenv("ENABLE_COLLECTORS") != "false" {
			netflowCollector := ndr.NewNetFlowCollector(2055, internalEvents)
			if err := netflowCollector.StartCollector(); err != nil {
				log.Printf("NetFlow collector skipped: %v", err)
			}
			suricataCollector := ndr.NewSuricataCollector("/var/log/suricata/eve.json", internalEvents)
			if err := suricataCollector.StartCollector(); err != nil {
				log.Printf("Suricata collector skipped: %v", err)
			}
		}
	}

	// 6. External Integrations
	c := cache.NewCache()
	threatIntel := tip.NewTIP(cfg.VirusTotalKey)
	adConnector := &enrichment.MockActiveDirectoryConnector{}
	snowConnector := &enrichment.MockServiceNowConnector{}

	// Search Client
	osClient, err := search.NewClient()
	if err != nil {
		log.Printf("Warning: Search Engine client not ready: %v", err)
	}

	// 7. Setup Router
	router := routes.NewRouter(cfg, database, c, &threatIntel, adConnector, snowConnector, osClient)
	router.Handle("/metrics", promhttp.Handler())

	// FIX: Apply CORS Globally at the Server Level
	// This ensures OPTIONS requests are handled even if the router doesn't match the path
	cWrapper := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type", "X-Requested-With"},
		AllowCredentials: true,
		// Debug: true, // Uncomment to see CORS logs in Render
	})

	// Wrap the OTel handler with CORS
	finalHandler := cWrapper.Handler(otelmux.Middleware("nexdefend-api")(router))

	// 8. Start Server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: finalHandler, // Use the wrapped handler
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

// ... [Keep startDemoTrafficGenerator and gracefulShutdown unchanged] ...
func startDemoTrafficGenerator(events chan<- models.CommonEvent) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	ips := []string{"192.168.1.10", "192.168.1.55", "10.0.0.5", "172.16.0.23"}
	alertTypes := []string{"SSH Brute Force", "Malware C&C", "Port Scan", "SQL Injection"}

	for range ticker.C {
		if rand.Float32() < 0.1 {
			evt := models.CommonEvent{
				Timestamp: time.Now(),
				EventType: "alert",
				SrcIP:     ips[rand.Intn(len(ips))],
				DestIP:    "192.168.1.100",
				Severity:  "medium",
				Message:   alertTypes[rand.Intn(len(alertTypes))],
				Data: map[string]interface{}{
					"proto": "TCP",
					"app":   "http",
				},
			}
			events <- evt
		}
	}
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
