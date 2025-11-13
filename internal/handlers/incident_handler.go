package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/gorm"
)

type IncidentHandler struct {
	db *gorm.DB
}

func NewIncidentHandler(db *gorm.DB) *IncidentHandler {
	return &IncidentHandler{db: db}
}

func (h *IncidentHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	var incident models.Incident
	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Create(&incident).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(incident)
}

func (h *IncidentHandler) GetIncidents(w http.ResponseWriter, r *http.Request) {
	var incidents []models.Incident
	if err := h.db.Find(&incidents).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(incidents)
}

func (h *IncidentHandler) GetIncident(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	var incident models.Incident
	if err := h.db.First(&incident, id).Error; err != nil {
		http.Error(w, "Incident not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(incident)
}

func (h *IncidentHandler) UpdateIncident(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)
	id, err := strconv.Atoi(params["id"])
	if err != nil {
		http.Error(w, "Invalid incident ID", http.StatusBadRequest)
		return
	}

	var incident models.Incident
	if err := h.db.First(&incident, id).Error; err != nil {
		http.Error(w, "Incident not found", http.StatusNotFound)
		return
	}

	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.db.Save(&incident).Error; err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(incident)
}
