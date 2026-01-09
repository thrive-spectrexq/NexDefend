package handlers

import (
	"log"
	"time"

	"gorm.io/gorm"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// StartActiveAgentCollector starts a background job to check for offline agents
func StartActiveAgentCollector(db *gorm.DB) {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		// Mark agents offline if no heartbeat for 10 minutes
		threshold := time.Now().Add(-10 * time.Minute)
		result := db.Model(&models.Asset{}).Where("last_heartbeat < ?", threshold).Update("status", "offline")

		if result.Error != nil {
			log.Printf("Error updating offline agents: %v", result.Error)
		} else if result.RowsAffected > 0 {
			log.Printf("Marked %d agents as offline", result.RowsAffected)
		}
	}
}
