package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/gorm"
)

type SettingsHandler struct {
	DB *gorm.DB
}

func NewSettingsHandler(db *gorm.DB) *SettingsHandler {
	return &SettingsHandler{DB: db}
}

// GetSettings returns all system settings
func (h *SettingsHandler) GetSettings(w http.ResponseWriter, r *http.Request) {
	var settings []models.SystemSettings
	if err := h.DB.Find(&settings).Error; err != nil {
		http.Error(w, "Failed to fetch settings", http.StatusInternalServerError)
		return
	}

	// Mask secrets
	for i, s := range settings {
		if s.IsSecret && s.Value != "" {
			settings[i].Value = "********"
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(settings)
}

// UpdateSettings updates a list of settings
func (h *SettingsHandler) UpdateSettings(w http.ResponseWriter, r *http.Request) {
	var input []models.SystemSettings
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	tx := h.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	for _, s := range input {
		// Skip if empty key
		if s.Key == "" {
			continue
		}

		// Don't update secrets if value is masked or empty
		if s.IsSecret && (s.Value == "********" || s.Value == "") {
			continue
		}

		var existing models.SystemSettings
		result := tx.Where("key = ?", s.Key).First(&existing)

		if result.Error == gorm.ErrRecordNotFound {
			// Create new
			if err := tx.Create(&s).Error; err != nil {
				tx.Rollback()
				http.Error(w, "Failed to create setting: "+s.Key, http.StatusInternalServerError)
				return
			}
		} else {
			// Update
			existing.Value = s.Value
			// Optional: Update category/desc if provided
			if s.Category != "" {
				existing.Category = s.Category
			}
			if err := tx.Save(&existing).Error; err != nil {
				tx.Rollback()
				http.Error(w, "Failed to update setting: "+s.Key, http.StatusInternalServerError)
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		http.Error(w, "Transaction failed", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}
