
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/agent"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

func EnrollAgentHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var enrollmentRequest models.AgentEnrollmentRequest
		if err := json.NewDecoder(r.Body).Decode(&enrollmentRequest); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		newAgent, err := agent.EnrollAgent(enrollmentRequest)
		if err != nil {
			http.Error(w, "Failed to enroll agent", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newAgent)
	}
}
