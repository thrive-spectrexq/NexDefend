package handlers

import (
	"encoding/json"
	"net/http"

	"gorm.io/gorm"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

type CaseManagementHandler struct {
	db *gorm.DB
}

func NewCaseManagementHandler(db *gorm.DB) *CaseManagementHandler {
	return &CaseManagementHandler{db: db}
}

func (h *CaseManagementHandler) CreateCase(w http.ResponseWriter, r *http.Request) {
	// Stub implementation
	var createCaseRequest struct {
		Title string `json:"title"`
	}
	if err := json.NewDecoder(r.Body).Decode(&createCaseRequest); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	newCase := models.Case{Title: createCaseRequest.Title, Status: "Open"}
	// h.db.Create(&newCase)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newCase)
}

func (h *CaseManagementHandler) GetCases(w http.ResponseWriter, r *http.Request) {
	// Stub
	json.NewEncoder(w).Encode([]models.Case{})
}
