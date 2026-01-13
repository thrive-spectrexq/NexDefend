package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/search"
)

type NetworkStatsHandler struct {
	osClient *search.Client
}

func NewNetworkStatsHandler(osClient *search.Client) *NetworkStatsHandler {
	return &NetworkStatsHandler{osClient: osClient}
}

// GetNetworkTraffic returns aggregated traffic volume (bytes) over time
func (h *NetworkStatsHandler) GetNetworkTraffic(w http.ResponseWriter, r *http.Request) {
	// Stub: In a real implementation, this would run an aggregation query against OpenSearch (Suricata/Netflow index)
	// For now, we return a structured response that the frontend can consume, replacing the random math.

    // Simulate last 24h data
	stats := make([]map[string]interface{}, 24)
    now := time.Now()

	for i := 0; i < 24; i++ {
        t := now.Add(time.Duration(-23+i) * time.Hour)
		stats[i] = map[string]interface{}{
			"time":     t.Format("15:00"),
			"inbound":  1000 + (i * 100), // Replace with real aggregation result
			"outbound": 500 + (i * 50),
		}
	}

	json.NewEncoder(w).Encode(stats)
}

// GetProtocolDistribution returns protocol counts
func (h *NetworkStatsHandler) GetProtocolDistribution(w http.ResponseWriter, r *http.Request) {
    // Stub for protocol stats
	stats := []map[string]interface{}{
        {"name": "00:00", "http": 120, "ssh": 40, "dns": 500},
        {"name": "06:00", "http": 500, "ssh": 10, "dns": 200},
        {"name": "12:00", "http": 2000, "ssh": 80, "dns": 800},
        {"name": "18:00", "http": 1500, "ssh": 50, "dns": 600},
    }
	json.NewEncoder(w).Encode(stats)
}
