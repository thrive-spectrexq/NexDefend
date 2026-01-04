package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

type TopologyNode struct {
	ID       string   `json:"id"`
	Type     string   `json:"type"` // "custom" for ReactFlow
	Data     NodeData `json:"data"`
	Position Position `json:"position"`
}

type NodeData struct {
	Label       string `json:"label"`
	IP          string `json:"ip"`
	Status      string `json:"status"`      // "online", "offline", "compromised"
	Criticality string `json:"criticality"` // "high", "medium", "low"
	OS          string `json:"os"`
}

type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

type TopologyEdge struct {
	ID       string    `json:"id"`
	Source   string    `json:"source"`
	Target   string    `json:"target"`
	Animated bool      `json:"animated"`
	Style    EdgeStyle `json:"style"`
}

type EdgeStyle struct {
	Stroke string `json:"stroke"`
}

type TopologyResponse struct {
	Nodes []TopologyNode `json:"nodes"`
	Edges []TopologyEdge `json:"edges"`
}

// GetTopologyHandler returns the graph data for the frontend
func GetTopologyHandler(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var assets []models.Asset
		// Fetch all assets
		result := database.GetDB().Find(&assets)
		if result.Error != nil {
			http.Error(w, "Error fetching assets", http.StatusInternalServerError)
			return
		}

		nodes := []TopologyNode{}
		edges := []TopologyEdge{}

		// 1. Generate Nodes from Assets
		// We arrange them in a simple grid for now (Frontend can apply auto-layout)
		cols := 4
		for i, asset := range assets {
			row := i / cols
			col := i % cols

			nodes = append(nodes, TopologyNode{
				ID:   strconv.Itoa(asset.ID),
				Type: "assetNode", // We will create this custom type in React
				Position: Position{
					X: col * 250,
					Y: row * 150,
				},
				Data: NodeData{
					Label:       asset.Hostname,
					IP:          asset.IPAddress,
					Status:      asset.Status,
					Criticality: asset.Criticality,
					OS:          asset.OSVersion,
				},
			})

			// 2. Generate Mock Edges (For demonstration until NetFlow is fully queryable)
			// Connect every 2nd node to the first node (Simulating a Gateway/Server relationship)
			if i > 0 && i%2 == 0 {
				edges = append(edges, TopologyEdge{
					ID:       "e" + strconv.Itoa(assets[0].ID) + "-" + strconv.Itoa(asset.ID),
					Source:   strconv.Itoa(assets[0].ID),
					Target:   strconv.Itoa(asset.ID),
					Animated: true,
					Style:    EdgeStyle{Stroke: "#38bdf8"}, // Brand Blue
				})
			}
		}

		response := TopologyResponse{
			Nodes: nodes,
			Edges: edges,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}
