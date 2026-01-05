package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/gorm"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

type IncidentHandler struct {
	DB *gorm.DB
}

func NewIncidentHandler(db *gorm.DB) *IncidentHandler {
	return &IncidentHandler{DB: db}
}

// CreateIncident creates a new incident (often called by the AI or Correlation Engine)
func (h *IncidentHandler) CreateIncident(w http.ResponseWriter, r *http.Request) {
	var incident models.Incident
	if err := json.NewDecoder(r.Body).Decode(&incident); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	incident.Status = "Open"
	incident.CreatedAt = time.Now()

	if err := h.DB.Create(&incident).Error; err != nil {
		http.Error(w, "Failed to create incident", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(incident)
}

// GetIncidents returns a filtered list of incidents
func (h *IncidentHandler) GetIncidents(w http.ResponseWriter, r *http.Request) {
	var incidents []models.Incident

	query := h.DB.Model(&models.Incident{})

	// Filter by status if provided (e.g., ?status=Open)
	status := r.URL.Query().Get("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// Filter by severity if provided
	severity := r.URL.Query().Get("severity")
	if severity != "" {
		query = query.Where("severity = ?", severity)
	}

	query.Order("created_at desc").Find(&incidents)
	json.NewEncoder(w).Encode(incidents)
}

// GetIncident returns full details including audit logs/notes
func (h *IncidentHandler) GetIncident(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var incident models.Incident
	// Preload any related notes or audit logs if you have them in the model
	if err := h.DB.First(&incident, id).Error; err != nil {
		http.Error(w, "Incident not found", http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(incident)
}

// UpdateIncident handles status changes and assigning users
func (h *IncidentHandler) UpdateIncident(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var updateData struct {
		Status   string `json:"status"`
		Assignee string `json:"assignee"`
		Note     string `json:"note"` // Optional note to append
	}

	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	var incident models.Incident
	if err := h.DB.First(&incident, id).Error; err != nil {
		http.Error(w, "Incident not found", http.StatusNotFound)
		return
	}

	// Apply updates
	if updateData.Status != "" {
		incident.Status = updateData.Status
	}
	if updateData.Assignee != "" {
		incident.AssignedTo = updateData.Assignee
	}

	// In a real app, you would save 'Note' to a separate IncidentNotes table linked by ID
	// For now, we update the timestamp
	incident.UpdatedAt = time.Now()

	if err := h.DB.Save(&incident).Error; err != nil {
		http.Error(w, "Failed to update incident", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(incident)
}
