package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/asset"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
	"gorm.io/gorm"
)

func CreateAssetHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		var a asset.Asset
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		a.OrganizationID = orgID
		if err := db.Create(&a).Error; err != nil {
			http.Error(w, "Failed to create asset", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(a)
	}
}

func GetAssetsHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		var assets []asset.Asset
		if err := db.Where("organization_id = ?", orgID).Find(&assets).Error; err != nil {
			http.Error(w, "Failed to get assets", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(assets)
	}
}

func GetAssetHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid asset ID", http.StatusBadRequest)
			return
		}

		var a asset.Asset
		if err := db.Where("id = ? AND organization_id = ?", id, orgID).First(&a).Error; err != nil {
			http.Error(w, "Asset not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(a)
	}
}

func UpdateAssetHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid asset ID", http.StatusBadRequest)
			return
		}

		var a asset.Asset
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if err := db.Model(&asset.Asset{}).Where("id = ? AND organization_id = ?", id, orgID).Updates(&a).Error; err != nil {
			http.Error(w, "Failed to update asset", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func DeleteAssetHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid asset ID", http.StatusBadRequest)
			return
		}

		if err := db.Where("id = ? AND organization_id = ?", id, orgID).Delete(&asset.Asset{}).Error; err != nil {
			http.Error(w, "Failed to delete asset", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func HeartbeatHandler(db *gorm.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		var a asset.Asset
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		a.OrganizationID = orgID
		a.LastHeartbeat = sql.NullTime{Time: time.Now(), Valid: true}
		a.Status = sql.NullString{String: "online", Valid: true}

		if err := db.Save(&a).Error; err != nil {
			http.Error(w, "Failed to process heartbeat", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}

func StartActiveAgentCollector(db *gorm.DB) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		var count int64
		if err := db.Model(&asset.Asset{}).Where("last_heartbeat > ?", time.Now().Add(-5*time.Minute)).Count(&count).Error; err != nil {
			continue
		}
		metrics.ActiveAgents.Set(float64(count))
	}
}
