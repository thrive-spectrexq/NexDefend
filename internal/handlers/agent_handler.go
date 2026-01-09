
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
)

type AgentHandler struct {
	db *gorm.DB
}

func NewAgentHandler(db *gorm.DB) *AgentHandler {
	return &AgentHandler{db: db}
}

func (h *AgentHandler) GetConfig(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	hostname := vars["hostname"]

	// Basic config logic: return default config, or custom if found in DB
	// For now, returning hardcoded default with some logic
	config := map[string]interface{}{
		"fim_paths":               []string{"/etc/passwd", "/etc/shadow", "/bin", "/sbin", "/usr/bin"},
		"collection_interval_sec": 30,
		"hostname":                hostname,
	}

	// You could query h.db for specific agent overrides here

	json.NewEncoder(w).Encode(config)
}
