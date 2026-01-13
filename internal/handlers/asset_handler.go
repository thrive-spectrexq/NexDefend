package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/gorm"
)

type AssetHandler struct {
	db *gorm.DB
}

func NewAssetHandler(db *gorm.DB) *AssetHandler {
	return &AssetHandler{db: db}
}

func (h *AssetHandler) CreateAsset(w http.ResponseWriter, r *http.Request) {
	var asset models.Asset
	if err := json.NewDecoder(r.Body).Decode(&asset); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Create(&asset).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(asset)
}

func (h *AssetHandler) GetAssets(w http.ResponseWriter, r *http.Request) {
	var assets []models.Asset
	if err := h.db.Find(&assets).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(assets)
}

func (h *AssetHandler) GetAsset(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid asset ID", http.StatusBadRequest)
		return
	}

	var asset models.Asset
	if err := h.db.First(&asset, id).Error; err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(asset)
}

func (h *AssetHandler) UpdateAsset(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid asset ID", http.StatusBadRequest)
		return
	}

	var asset models.Asset
	if err := h.db.First(&asset, id).Error; err != nil {
		http.Error(w, "Asset not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&asset); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Save(&asset).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(asset)
}

func (h *AssetHandler) DeleteAsset(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid asset ID", http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.Asset{}, id).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *AssetHandler) Heartbeat(w http.ResponseWriter, r *http.Request) {
	var heartbeatData models.Asset
	if err := json.NewDecoder(r.Body).Decode(&heartbeatData); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Update asset status and last heartbeat
	var asset models.Asset
	if err := h.db.Where("hostname = ?", heartbeatData.Hostname).First(&asset).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Register new asset if it doesn't exist
			heartbeatData.Status = "online"
			heartbeatData.LastHeartbeat = time.Now()
			heartbeatData.OrganizationID = 1

			if err := h.db.Create(&heartbeatData).Error; err != nil {
				http.Error(w, "Failed to register new asset", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(heartbeatData)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	asset.LastHeartbeat = time.Now()
	asset.Status = "online"
	asset.IPAddress = heartbeatData.IPAddress
	asset.OSVersion = heartbeatData.OSVersion
	asset.AgentVersion = heartbeatData.AgentVersion
	asset.MACAddress = heartbeatData.MACAddress

	if err := h.db.Save(&asset).Error; err != nil {
		http.Error(w, "Failed to update asset heartbeat", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(asset)
}

// GetCloudAssets returns all cloud assets
func (h *AssetHandler) GetCloudAssets(w http.ResponseWriter, r *http.Request) {
	var assets []models.CloudAsset
	if err := h.db.Find(&assets).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(assets)
}

// GetKubernetesPods returns all K8s pods
func (h *AssetHandler) GetKubernetesPods(w http.ResponseWriter, r *http.Request) {
	var pods []models.KubernetesPod
	if err := h.db.Find(&pods).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(pods)
}

// TriggerSync forces a sync with cloud providers
func (h *AssetHandler) TriggerSync(w http.ResponseWriter, r *http.Request) {
	// Stub: In a real implementation, this would trigger the cloud connector to fetch new assets
	// For now, we return 200 OK to satisfy the frontend call
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "sync_initiated"})
}
