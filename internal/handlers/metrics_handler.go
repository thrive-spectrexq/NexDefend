
package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

type MetricsHandler struct {
	db *db.Database
}

func NewMetricsHandler(db *db.Database) *MetricsHandler {
	return &MetricsHandler{db: db}
}

// GetSystemMetrics returns system metrics for the dashboard
func (h *MetricsHandler) GetSystemMetrics(w http.ResponseWriter, r *http.Request) {
	// Parse query params for time range (defaults to last 1 hour)
	from := time.Now().Add(-1 * time.Hour)
	to := time.Now()

	// Use Organization ID from context or default to 1
	orgID := 1

	cpuMetrics, _ := h.db.GetSystemMetrics("cpu_load", from, to, orgID)
	memMetrics, _ := h.db.GetSystemMetrics("memory_usage", from, to, orgID)
	diskMetrics, _ := h.db.GetSystemMetrics("disk_usage", from, to, orgID)

	response := map[string][]models.SystemMetric{
		"cpu":    cpuMetrics,
		"memory": memMetrics,
		"disk":   diskMetrics,
	}

	json.NewEncoder(w).Encode(response)
}
