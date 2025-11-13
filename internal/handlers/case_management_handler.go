
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/case_management"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

func CreateCaseHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var createCaseRequest models.CreateCaseRequest
		if err := json.NewDecoder(r.Body).Decode(&createCaseRequest); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		newCase, err := case_management.CreateCase(createCaseRequest)
		if err != nil {
			http.Error(w, "Failed to create case", http.StatusInternalServerError)
			return
		}

		metrics.IncidentsCreated.WithLabelValues("low").Inc()

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newCase)
	}
}
