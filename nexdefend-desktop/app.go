package main

import (
	"context"
	"fmt"
	"time"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/agent"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db.InitDB()
	agent.StartAgent()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// GetMetrics returns real metrics from the local SQLite DB
func (a *App) GetMetrics() map[string]interface{} {
	var processCount db.Metric
	// Get the latest process count metric
	db.DB.Where("type = ?", "process_count").Last(&processCount)

	return map[string]interface{}{
		"active_threats": 0, // Placeholder
		"monitored_assets": 1, // Localhost
		"process_count": processCount.Value,
		"system_health": "Good",
		"last_updated": time.Now().Format(time.RFC3339),
	}
}
