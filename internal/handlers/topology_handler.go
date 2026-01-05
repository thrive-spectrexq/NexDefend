package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
)

// Node represents a device on the graph
type Node struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Type  string `json:"type"` // e.g., "internal", "external", "router"
}

// Edge represents a connection between devices
type Edge struct {
	Source string `json:"source"`
	Target string `json:"target"`
	Weight int    `json:"weight"` // Number of connections
}

type TopologyResponse struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
}

// GetTopologyHandler aggregates network flows to build a graph
func GetTopologyHandler(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Initialize OpenSearch client (inject in production)
		osClient, _ := opensearch.NewClient(opensearch.Config{
			Addresses: []string{"http://opensearch:9200"},
		})

		// OpenSearch Aggregation Query: Group by SrcIP -> DstIP
		// This finds who is talking to whom and how often
		query := `
		{
			"size": 0,
			"aggs": {
				"sources": {
					"terms": { "field": "src_ip.keyword", "size": 50 },
					"aggs": {
						"destinations": {
							"terms": { "field": "dest_ip.keyword", "size": 50 }
						}
					}
				}
			}
		}`

		res, err := osClient.Search(
			osClient.Search.WithContext(context.Background()),
			osClient.Search.WithIndex("nexdefend-flows"), // Assuming flow index exists
			osClient.Search.WithBody(strings.NewReader(query)),
		)

		if err != nil {
			http.Error(w, "Failed to query topology", http.StatusInternalServerError)
			return
		}
		defer res.Body.Close()

		// Parse Response
		var result map[string]interface{}
		json.NewDecoder(res.Body).Decode(&result)

		nodesMap := make(map[string]Node)
		var edges []Edge

		// Navigate JSON structure (buckets)
		aggregations, _ := result["aggregations"].(map[string]interface{})
		if aggregations == nil {
			// Return empty topology if no aggregations found
			json.NewEncoder(w).Encode(TopologyResponse{Nodes: []Node{}, Edges: []Edge{}})
			return
		}

		sources, _ := aggregations["sources"].(map[string]interface{})
		if sources == nil {
			json.NewEncoder(w).Encode(TopologyResponse{Nodes: []Node{}, Edges: []Edge{}})
			return
		}

		srcBuckets, _ := sources["buckets"].([]interface{})

		for _, src := range srcBuckets {
			s := src.(map[string]interface{})
			srcIP := s["key"].(string)

			// Add Source Node
			if _, exists := nodesMap[srcIP]; !exists {
				nodesMap[srcIP] = Node{ID: srcIP, Label: srcIP, Type: determineType(srcIP)}
			}

			destinations, _ := s["destinations"].(map[string]interface{})
			destBuckets, _ := destinations["buckets"].([]interface{})

			for _, dst := range destBuckets {
				d := dst.(map[string]interface{})
				dstIP := d["key"].(string)
				docCount := int(d["doc_count"].(float64))

				// Add Target Node
				if _, exists := nodesMap[dstIP]; !exists {
					nodesMap[dstIP] = Node{ID: dstIP, Label: dstIP, Type: determineType(dstIP)}
				}

				// Add Edge
				edges = append(edges, Edge{
					Source: srcIP,
					Target: dstIP,
					Weight: docCount,
				})
			}
		}

		// Convert map to slice
		var nodes []Node
		for _, n := range nodesMap {
			nodes = append(nodes, n)
		}

		json.NewEncoder(w).Encode(TopologyResponse{Nodes: nodes, Edges: edges})
	}
}

// Helper to guess device type based on IP (simplified)
func determineType(ip string) string {
	if strings.HasPrefix(ip, "192.168.") || strings.HasPrefix(ip, "10.") {
		return "internal"
	}
	return "external"
}
