package main

import (
	"context"
	"fmt"
	"os"

	"github.com/shirou/gopsutil/v3/process"
	"github.com/wailsapp/wails/v2/pkg/runtime"

	"nexdefend-desktop/internal/agent"
	"nexdefend-desktop/internal/bus"
	"nexdefend-desktop/internal/config"
	"nexdefend-desktop/internal/ndr"
	"nexdefend-desktop/internal/search"
)

type App struct {
	ctx         context.Context
	indexer     *search.LocalIndexer
	configStore *config.Store
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

	// 2. Initialize Config Store
	cfgPath := os.TempDir() // Or os.UserConfigDir()
	store, err := config.NewStore(cfgPath)
	if err != nil {
		fmt.Printf("Error initializing config store: %v\n", err)
	} else {
		a.configStore = store
	}

	// 3. Start Network Monitor
	ndr.StartMonitoring()

	// 4. Bridge Event Bus to Frontend
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

// --- Config Methods ---

func (a *App) SaveSettings(cfg config.AppConfig) string {
	if a.configStore == nil { return "Store not ready" }
	err := a.configStore.Save(cfg)
	if err != nil { return err.Error() }
	return "Settings Saved"
}

func (a *App) GetSettings() config.AppConfig {
	if a.configStore == nil { return config.AppConfig{} }
	return a.configStore.Get()
}

// --- Process Control Methods ---

func (a *App) GetProcessDetail(pid int32) agent.ProcessDetail {
	details, err := agent.GetProcessDetails(pid)
	if err != nil {
		return agent.ProcessDetail{Name: "Error or Access Denied"}
	}
	return *details
}

func (a *App) KillProcess(pid int32) string {
	err := agent.KillProcess(pid)
	if err != nil {
		return "Failed to kill process: " + err.Error()
	}
	return "Process Terminated"
}

// ProcessInfo struct for the list view
type ProcessInfo struct {
	PID  int32   `json:"pid"`
	Name string  `json:"name"`
	CPU  float64 `json:"cpu"`
	Mem  float32 `json:"mem"`
}

// GetRunningProcesses returns a list of all running processes with basic stats
func (a *App) GetRunningProcesses() []ProcessInfo {
	procs, err := process.Processes()
	if err != nil {
		return []ProcessInfo{}
	}

	var list []ProcessInfo
	for _, p := range procs {
		name, _ := p.Name()
		cpu, _ := p.CPUPercent()
		mem, _ := p.MemoryPercent()

		list = append(list, ProcessInfo{
			PID:  p.Pid,
			Name: name,
			CPU:  cpu,
			Mem:  mem,
		})
	}
	return list
}
