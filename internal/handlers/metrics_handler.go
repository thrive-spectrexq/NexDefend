package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/db"
)

type MetricsHandler struct {
	db *db.Database
}

func NewMetricsHandler(db *db.Database) *MetricsHandler {
	return &MetricsHandler{db: db}
}

// SystemMetricsResponse matches the frontend interface
type SystemMetricsResponse struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
	DiskUsage   float64 `json:"disk_usage"`
	NetworkIn   float64 `json:"network_in"`
	NetworkOut  float64 `json:"network_out"`
}

// GetSystemMetrics returns system metrics for the dashboard
func (h *MetricsHandler) GetSystemMetrics(w http.ResponseWriter, r *http.Request) {
	// Fetch metrics for the last 5 minutes to ensure we get the latest
	from := time.Now().Add(-5 * time.Minute)
	to := time.Now()
	orgID := 1

	// Helper to get latest value
	getLatest := func(metricType string) float64 {
		metrics, err := h.db.GetSystemMetrics(metricType, from, to, orgID)
		if err == nil && len(metrics) > 0 {
			// Return the last one (assuming implicit time order or ID order)
			return metrics[len(metrics)-1].Value
		}
		return 0.0
	}

	response := SystemMetricsResponse{
		CPUUsage:    getLatest("cpu_load"),
		MemoryUsage: getLatest("memory_usage"),
		DiskUsage:   getLatest("disk_usage"),
		NetworkIn:   0.0, // Not yet collected
		NetworkOut:  0.0, // Not yet collected
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
