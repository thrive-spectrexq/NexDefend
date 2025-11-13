package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/cloud"
	"gorm.io/gorm"
)

// CloudCredentialHandler handles the API requests for cloud credentials
type CloudCredentialHandler struct {
	DB *gorm.DB
}

// NewCloudCredentialHandler creates a new CloudCredentialHandler
func NewCloudCredentialHandler(db *gorm.DB) *CloudCredentialHandler {
	return &CloudCredentialHandler{DB: db}
}

// CreateCloudCredential handles the creation of a new cloud credential
func (h *CloudCredentialHandler) CreateCloudCredential(w http.ResponseWriter, r *http.Request) {
	var cred cloud.CloudCredential
	if err := json.NewDecoder(r.Body).Decode(&cred); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real implementation, you would encrypt the credentials here
	if err := h.DB.Create(&cred).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cred)
}
