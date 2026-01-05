package main

import (
	"context"
	"fmt"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"

	"nexdefend-desktop/internal/bus"
	"nexdefend-desktop/internal/ndr"
	"nexdefend-desktop/internal/search"
)

type App struct {
	ctx     context.Context
	indexer *search.LocalIndexer
}

func NewApp() *App {
	return &App{}
}

// startup is called by Wails when the app loads
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// 1. Initialize Local Search
	// We use the user's temp dir for demo purposes.
	// In prod, use: os.UserConfigDir()
	dataDir := os.TempDir()
	idx, err := search.NewIndexer(dataDir)
	if err != nil {
		fmt.Printf("Error initializing search: %v\n", err)
	} else {
		a.indexer = idx
	}

	// 2. Start Network Monitor
	ndr.StartMonitoring()

	// 3. Bridge Event Bus to Frontend
	// This goroutine listens to Go channel updates and emits them to React
	go a.bridgeEvents()
}

func (a *App) bridgeEvents() {
	flowCh := bus.GetBus().Subscribe(bus.EventNetFlow)
	alertCh := bus.GetBus().Subscribe(bus.EventSecurityAlert)

	for {
		select {
		case flow := <-flowCh:
			// Emit "network-flow" event to Javascript
			runtime.EventsEmit(a.ctx, "network-flow", flow)
		case alert := <-alertCh:
			// Emit "security-alert" event to Javascript
			runtime.EventsEmit(a.ctx, "security-alert", alert)
		}
	}
}

// --- Exposed Methods callable from React ---

// SearchLogs allows the frontend to query the Bleve index
func (a *App) SearchLogs(query string) map[string]interface{} {
	if a.indexer == nil {
		return map[string]interface{}{"error": "Search engine not ready"}
	}

	results, err := a.indexer.Search(query)
	if err != nil {
		return map[string]interface{}{"error": err.Error()}
	}

	return map[string]interface{}{
		"total_hits": results.Total,
		"hits":       results.Hits,
		"took":       results.Took.String(),
	}
}

// GetSystemInfo returns basic host info
func (a *App) GetSystemInfo() map[string]string {
	hostname, _ := os.Hostname()
	return map[string]string{
		"hostname": hostname,
		"status":   "Secure",
		"mode":     "Embedded/Offline",
	}
}
