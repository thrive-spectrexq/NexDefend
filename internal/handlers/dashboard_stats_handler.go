package handlers

import (
	"encoding/json"
	"net/http"
	"math/rand"

	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// GetDashboardStatsHandler aggregates counts for the dashboard honeycomb/list views
func GetDashboardStatsHandler(database *db.Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 1. Get Vulnerability Count (Postgres)
		var vulnCount int64
		database.GetDB().Model(&models.Vulnerability{}).Where("status = ?", "Open").Count(&vulnCount)

		// 2. Get Asset Count (Postgres)
		var assetCount int64
		database.GetDB().Model(&models.Asset{}).Count(&assetCount)

		// 3. Mock OpenSearch Aggregations (Replace with real OS client calls in production)
		// We simulate getting counts for FIM and General Events
		fimCount := int64(rand.Intn(50))   // Replace with: osClient.Count("event_type:fim")
		eventCount := int64(rand.Intn(5000) + 1000)

		// 4. Construct the Module Stats (Wazuh Style)
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
				Status: determineStatus(fimCount, 10), // Warning if > 10 changes
				Trend:  "flat",
			},
			{
				Name:   "Vulnerability Detector",
				Count:  vulnCount,
				Status: determineStatus(vulnCount, 5), // Warning if > 5 open vulns
				Trend:  "up",
			},
			{
				Name:   "Active Agents",
				Count:  assetCount,
				Status: "healthy",
				Trend:  "up",
			},
		}

		// 5. Construct Compliance Scores (Logic would go here to calculate real percentages)
		compliance := []models.ComplianceScore{
			{Standard: "PCI-DSS", Score: 85, Status: "pass"},
			{Standard: "GDPR", Score: 92, Status: "pass"},
			{Standard: "HIPAA", Score: 78, Status: "fail"},
		}

		response := models.DashboardSummary{
			Modules:    modules,
			Compliance: compliance,
			TotalEvents: eventCount,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
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
