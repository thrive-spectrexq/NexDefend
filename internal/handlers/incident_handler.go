package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/incident"
)

func CreateIncidentHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req incident.CreateIncidentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if req.Description == "" || req.Severity == "" {
			http.Error(w, "Description and severity are required", http.StatusBadRequest)
			return
		}

		newIncident, err := incident.CreateIncident(db, req)
		if err != nil {
			log.Printf("Error creating incident: %v", err)
			http.Error(w, "Failed to create incident", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(newIncident)
	}
}

func GetIncidentHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid incident ID", http.StatusBadRequest)
			return
		}

		inc, err := incident.GetIncident(db, id)
		if err != nil {
			log.Printf("Error getting incident: %v", err)
			http.Error(w, "Failed to retrieve incident", http.StatusInternalServerError)
			return
		}
		if inc == nil {
			http.Error(w, "Incident not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(inc)
	}
}

func ListIncidentsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		statusQuery := r.URL.Query().Get("status")
		var status *incident.Status

		if statusQuery != "" {
			s := incident.Status(statusQuery)
			status = &s
		}

		incidents, err := incident.ListIncidents(db, status)
		if err != nil {
			log.Printf("Error listing incidents: %v", err)
			http.Error(w, "Failed to retrieve incidents", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(incidents)
	}
}

func UpdateIncidentHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid incident ID", http.StatusBadRequest)
			return
		}

		var req incident.UpdateIncidentRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		updatedIncident, err := incident.UpdateIncident(db, id, req)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Incident not found", http.StatusNotFound)
				return
			}
			log.Printf("Error updating incident: %v", err)
			http.Error(w, "Failed to update incident", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(updatedIncident)
	}
}
