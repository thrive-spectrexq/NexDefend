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

	// Join with assets to find the config for the hostname
	// Assuming AgentConfig has a foreign key to Asset or we store hostname directly (model seems to link via AssetID)
	// The current model `AgentConfig` doesn't have `Hostname`. It has `AssetID`.
	// We need to look up the asset first.

	var asset models.Asset
	if err := h.db.Where("hostname = ?", hostname).First(&asset).Error; err != nil {
		// If asset not found, return default config
		json.NewEncoder(w).Encode(map[string]interface{}{
			"fim_paths":               []string{"/etc"},
			"collection_interval_sec": 10,
		})
		return
	}

	var agentConfig models.AgentConfig
	if err := h.db.Where("asset_id = ?", asset.ID).First(&agentConfig).Error; err != nil {
		// If config not found, return default
		json.NewEncoder(w).Encode(map[string]interface{}{
			"fim_paths":               []string{"/etc"},
			"collection_interval_sec": 10,
		})
		return
	}

	// We return the raw JSONB config
	w.Header().Set("Content-Type", "application/json")
	w.Write(agentConfig.ConfigJSONB)
}

func (h *AgentHandler) UpdateAgentConfig(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Hostname string                 `json:"hostname"`
		Config   map[string]interface{} `json:"config"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var asset models.Asset
	if err := h.db.Where("hostname = ?", req.Hostname).First(&asset).Error; err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	configJSON, err := json.Marshal(req.Config)
	if err != nil {
		http.Error(w, "Invalid config format", http.StatusBadRequest)
		return
	}

	var agentConfig models.AgentConfig
	if err := h.db.Where("asset_id = ?", asset.ID).First(&agentConfig).Error; err != nil {
		// Create new config
		newConfig := models.AgentConfig{
			AssetID:        asset.ID,
			ConfigJSONB:    configJSON,
			OrganizationID: asset.OrganizationID,
		}
		if err := h.db.Create(&newConfig).Error; err != nil {
			http.Error(w, "Failed to create agent config", http.StatusInternalServerError)
			return
		}
	} else {
		// Update existing
		agentConfig.ConfigJSONB = configJSON
		if err := h.db.Save(&agentConfig).Error; err != nil {
			http.Error(w, "Failed to update agent config", http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusOK)
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
