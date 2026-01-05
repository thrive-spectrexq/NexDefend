package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// GetDashboardStatsHandler aggregates real counts from Postgres and OpenSearch
func GetDashboardStatsHandler(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Get Real Vulnerability Count (Postgres)
		var vulnCount int64
		database.GetDB().Model(&models.Vulnerability{}).Where("status = ?", "Open").Count(&vulnCount)

		// 2. Get Real Asset Count (Postgres)
		var assetCount int64
		database.GetDB().Model(&models.Asset{}).Count(&assetCount)

		// 3. Get Real Event Counts from OpenSearch
		// In production, inject this client via the struct/config
		osClient, _ := opensearch.NewClient(opensearch.Config{
			Addresses: []string{"http://opensearch:9200"},
		})

		eventCount := getOpenSearchCount(osClient, "events", "match_all")
		fimCount := getOpenSearchCount(osClient, "events", "event_type:fim")

		// 4. Construct Real Module Stats
		modules := []models.ModuleStat{
			{
				Name:   "Security Events",
				Count:  eventCount,
				Status: "healthy",
				Trend:  "up",
			},
			{
				Name:   "Integrity Monitoring",
				Count:  fimCount,
				Status: determineStatus(fimCount, 50),
				Trend:  "flat",
			},
			{
				Name:   "Vulnerability Detector",
				Count:  vulnCount,
				Status: determineStatus(vulnCount, 10),
				Trend:  "up",
			},
			{
				Name:   "Active Agents",
				Count:  assetCount,
				Status: "healthy",
				Trend:  "up",
			},
		}

		response := models.DashboardSummary{
			Modules:    modules,
			TotalEvents: eventCount,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func getOpenSearchCount(client *opensearch.Client, index string, query string) int64 {
	q := fmt.Sprintf(`{"query": { "query_string": { "query": "%s" } } }`, query)
	res, err := client.Count(
		client.Count.WithIndex(index),
		client.Count.WithBody(strings.NewReader(q)),
	)
	if err != nil {
		return 0
	}
	defer res.Body.Close()

	var r map[string]interface{}
	if err := json.NewDecoder(res.Body).Decode(&r); err != nil {
		return 0
	}

	if count, ok := r["count"].(float64); ok {
		return int64(count)
	}
	return 0
}

func determineStatus(count int64, threshold int64) string {
	if count > threshold*2 {
		return "critical"
	}
	if count > threshold {
		return "warning"
	}
	return "healthy"
}
