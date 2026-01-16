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

	// 2. Initialize SQLite Database (Updated in db.go)
	database := db.InitDB()
	defer db.CloseDB()

	// 3. Setup Internal Event Channel
	// This channel acts as the "Queue" between Collectors and Ingestor
	internalEvents := make(chan models.CommonEvent, 1000)

	// 4. Start Core Engines
	correlationEngine := correlation.NewCorrelationEngine()

	// Start Ingestor (Passes data to SQLite & ZincSearch)
	go ingestor.StartIngestor(correlationEngine, internalEvents, database.GetDB())

	// Start System Metrics Collection
	go metrics.CollectMetrics(database)

	// Start Agent Collector (HTTP listener for Agents)
	go handlers.StartActiveAgentCollector(database.GetDB())

	// 5. Collectors (Suricata / NetFlow) OR Demo Mode
	// On Render, we usually disable physical collectors and enable Demo Mode.
	if os.Getenv("DEMO_MODE") == "true" {
		log.Println("--- DEMO MODE ENABLED: Generating simulated traffic ---")
		go startDemoTrafficGenerator(internalEvents)
	} else {
		// Only start real collectors if NOT in demo mode or explicitly enabled
		if os.Getenv("ENABLE_COLLECTORS") != "false" {
			// Real NetFlow
			netflowCollector := ndr.NewNetFlowCollector(2055, internalEvents)
			if err := netflowCollector.StartCollector(); err != nil {
				log.Printf("NetFlow collector skipped: %v", err)
			}

			// Real Suricata
			suricataCollector := ndr.NewSuricataCollector("/var/log/suricata/eve.json", internalEvents)
			if err := suricataCollector.StartCollector(); err != nil {
				log.Printf("Suricata collector skipped: %v", err)
			}
		}
	}

	// 6. External Integrations
	c := cache.NewCache()
	// Must explicitly use interface type so we can pass &threatIntel (pointer to interface) to NewRouter
	var threatIntel tip.TIP = tip.NewTIP(cfg.VirusTotalKey)
	adConnector := &enrichment.MockActiveDirectoryConnector{}
	snowConnector := &enrichment.MockServiceNowConnector{}

	// ZincSearch Client
	osClient, err := search.NewClient()
	if err != nil {
		log.Printf("Warning: Search Engine (Zinc) not ready yet: %v", err)
	}

	// 7. Setup Router
	router := routes.NewRouter(cfg, database, c, &threatIntel, adConnector, snowConnector, osClient)
	router.Handle("/metrics", promhttp.Handler())

	// 8. Start Server
	srv := &http.Server{
		Addr:    ":8080",
		Handler: otelmux.Middleware("nexdefend-api")(router),
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

// simulateTraffic generates fake events for the Live Demo
func startDemoTrafficGenerator(events chan<- models.CommonEvent) {
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	// Sample IPs and Events
	ips := []string{"192.168.1.10", "192.168.1.55", "10.0.0.5", "172.16.0.23"}
	alertTypes := []string{"SSH Brute Force", "Malware C&C", "Port Scan", "SQL Injection"}

	for range ticker.C {
		// 10% chance of generating a threat
		if rand.Float32() < 0.1 {
			evt := models.CommonEvent{
				Timestamp: time.Now(),
				EventType: "alert",
				IPAddress: ips[rand.Intn(len(ips))],
				Data: map[string]interface{}{
					"src_ip":   ips[rand.Intn(len(ips))],
					"dest_ip":  "192.168.1.100",
					"severity": "medium",
					"message":  alertTypes[rand.Intn(len(alertTypes))],
					"proto":    "TCP",
					"app":      "http",
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
