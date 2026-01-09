package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"gorm.io/gorm"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"github.com/thrive-spectrexq/NexDefend/internal/search"
)

type GetDashboardStatsHandler struct {
	db       *db.Database
	osClient *search.Client
}

func NewGetDashboardStatsHandler(gormDB *gorm.DB, osClient *search.Client) *GetDashboardStatsHandler {
	// Wrap gorm.DB into db.Database struct
	return &GetDashboardStatsHandler{db: &db.Database{DB: gormDB}, osClient: osClient}
}

// GetStats aggregates real counts from Postgres and OpenSearch
func (h *GetDashboardStatsHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	// 1. Get Real Vulnerability Count (Postgres)
	var vulnCount int64
	h.db.GetDB().Model(&models.Vulnerability{}).Where("status = ?", "Open").Count(&vulnCount)

	// 2. Get Real Asset Count (Postgres)
	var assetCount int64
	h.db.GetDB().Model(&models.Asset{}).Count(&assetCount)

	// 3. Get Real Event Counts from OpenSearch
	eventCount := h.getOpenSearchCount("events", "match_all")
	fimCount := h.getOpenSearchCount("events", "event_type:fim")

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

func (h *GetDashboardStatsHandler) getOpenSearchCount(index string, query string) int64 {
	if h.osClient == nil || h.osClient.Client == nil { return 0 }

	q := fmt.Sprintf(`{"query": { "query_string": { "query": "%s" } } }`, query)
	res, err := h.osClient.Count(
		h.osClient.Count.WithIndex(index),
		h.osClient.Count.WithBody(strings.NewReader(q)),
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
