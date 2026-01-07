
package main

import (
	"context"
	"fmt"
	"log"
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
	"github.com/thrive-spectrexq/NexDefend/internal/telemetry"
	"github.com/thrive-spectrexq/NexDefend/internal/tip"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
)

func main() {
	cfg := config.LoadConfig()

	tp, err := telemetry.InitTracerProvider()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	logging.InitLogging()
	database := db.InitDB()
	defer db.CloseDB()

	// Channel for internal events (NetFlow, Suricata) to reach Ingestor
	internalEvents := make(chan models.CommonEvent, 1000)

	correlationEngine := correlation.NewCorrelationEngine()
	go ingestor.StartIngestor(correlationEngine, internalEvents, database.GetDB())
	go metrics.CollectMetrics(database)
	go handlers.StartActiveAgentCollector(database.GetDB())

	// Use real NetFlow collector on port 2055
	netflowCollector := ndr.NewNetFlowCollector(2055, internalEvents)
	if err := netflowCollector.StartCollector(); err != nil {
		log.Printf("Failed to start NetFlow collector: %v", err) // Non-fatal, might be permission issue
	}

	// Use real Suricata collector tailing default log path
	suricataCollector := ndr.NewSuricataCollector("/var/log/suricata/eve.json", internalEvents)
	if err := suricataCollector.StartCollector(); err != nil {
		log.Printf("Failed to start Suricata collector: %v", err) // Non-fatal, file might not exist yet
	}

	c := cache.NewCache()
	tip := tip.NewTIP(cfg.VirusTotalKey)
	adConnector := &enrichment.MockActiveDirectoryConnector{}
	snowConnector := &enrichment.MockServiceNowConnector{}
	router := routes.NewRouter(cfg, database, c, tip, adConnector, snowConnector)

	// Add Prometheus metrics endpoint
	router.Handle("/metrics", promhttp.Handler())

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
