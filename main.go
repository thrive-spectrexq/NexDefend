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
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/fim" // Import FIM
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
	"github.com/thrive-spectrexq/NexDefend/internal/routes"
	"github.com/thrive-spectrexq/NexDefend/internal/threat"
)

func main() {
	cfg := config.LoadConfig()

	logging.InitLogging()
	database := db.InitDB()
	defer db.CloseDB()

	threat.InitDetection(cfg.PythonAPI, cfg.AIServiceToken)
	go threat.StartThreatDetection(database)
	go metrics.CollectMetrics(database)

	// Start File Integrity Monitoring
	fimPath := os.Getenv("FIM_PATH")
	if fimPath == "" {
		fimPath = "." // Default to current directory for dev
		log.Println("WARNING: FIM_PATH not set, monitoring current directory '.'")
	}
	go fim.RunWatcher(database.GetDB(), fimPath)

	c := cache.NewCache()
	router := routes.NewRouter(cfg, database, c)

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
