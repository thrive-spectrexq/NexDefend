package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/search"
)

type TopologyHandler struct {
	osClient *search.Client
}

func NewTopologyHandler(osClient *search.Client) *TopologyHandler {
	return &TopologyHandler{osClient: osClient}
}

func (h *TopologyHandler) GetTopology(w http.ResponseWriter, r *http.Request) {
	// Stub for now
	nodes := []map[string]interface{}{
		{"id": "Internet", "group": 1},
		{"id": "Router", "group": 2},
		{"id": "Server-01", "group": 3},
	}
	links := []map[string]interface{}{
		{"source": "Internet", "target": "Router", "value": 1},
		{"source": "Router", "target": "Server-01", "value": 5},
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"nodes": nodes,
		"links": links,
	})
}
