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

func (h *MetricsHandler) GetMetrics(w http.ResponseWriter, r *http.Request) {
	metricType := r.URL.Query().Get("type")
	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	from, err := time.Parse(time.RFC3339, fromStr)
	if err != nil {
		http.Error(w, "Invalid 'from' timestamp", http.StatusBadRequest)
		return
	}

	to, err := time.Parse(time.RFC3339, toStr)
	if err != nil {
		http.Error(w, "Invalid 'to' timestamp", http.StatusBadRequest)
		return
	}

	// In a real application, you would get the organization ID from the user's session
	organizationID := 1

	metrics, err := h.db.GetSystemMetrics(metricType, from, to, organizationID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(metrics)
}
