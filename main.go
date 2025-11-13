
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/cache"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/correlation"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/enrichment"
	"github.com/thrive-spectrexq/NexDefend/internal/ingestor"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
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

	correlationEngine := &correlation.MockCorrelationEngine{}
	go ingestor.StartIngestor(correlationEngine)
	go metrics.CollectMetrics(database)

	netflowCollector := &ndr.MockNetFlowCollector{}
	if err := netflowCollector.StartCollector(); err != nil {
		log.Fatalf("Failed to start NetFlow collector: %v", err)
	}

	suricataCollector := &ndr.MockSuricataCollector{}
	if err := suricataCollector.StartCollector(); err != nil {
		log.Fatalf("Failed to start Suricata collector: %v", err)
	}

	c := cache.NewCache()
	tip := &tip.MockTIP{}
	adConnector := &enrichment.MockActiveDirectoryConnector{}
	snowConnector := &enrichment.MockServiceNowConnector{}
	router := routes.NewRouter(cfg, database, c, tip, adConnector, snowConnector)

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

func gracefulShutdown(srv *http.server) {
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
