package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
)

// MetricsHandler handles requests for system metrics
func MetricsHandler(store metrics.MetricStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		metricType := r.URL.Query().Get("type")
		if metricType == "" {
			http.Error(w, "Missing 'type' query parameter", http.StatusBadRequest)
			return
		}

		fromStr := r.URL.Query().Get("from")
		toStr := r.URL.Query().Get("to")

		from, err := time.Parse(time.RFC3339, fromStr)
		if err != nil {
			from = time.Now().Add(-1 * time.Hour) // Default to last hour
		}

		to, err := time.Parse(time.RFC3339, toStr)
		if err != nil {
			to = time.Now()
		}

		results, err := store.GetSystemMetrics(metricType, from, to, orgID)
		if err != nil {
			http.Error(w, "Failed to fetch system metrics", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}
