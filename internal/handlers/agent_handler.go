package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/agent"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/gorm"
)

type AgentHandler struct {
	db *gorm.DB
}

func NewAgentHandler(db *gorm.DB) *AgentHandler {
	return &AgentHandler{db: db}
}

func (h *AgentHandler) GetAgentConfig(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	hostname := params["hostname"]

	var agentConfig models.AgentConfig
	if err := h.db.Where("hostname = ?", hostname).First(&agentConfig).Error; err != nil {
		http.Error(w, "Agent config not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(agentConfig)
}

func EnrollAgentHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var enrollmentRequest models.AgentEnrollmentRequest
		if err := json.NewDecoder(r.Body).Decode(&enrollmentRequest); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		newAgent, err := agent.EnrollAgent(enrollmentRequest)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newAgent)
	}
}

func StartActiveAgentCollector(db *gorm.DB) {
	// In a real implementation, you would start a background process
	// to collect data from active agents.
}
