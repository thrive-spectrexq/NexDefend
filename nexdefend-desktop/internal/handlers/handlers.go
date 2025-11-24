package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
)

// StartAPIServer starts the embedded HTTP server
func StartAPIServer() {
	r := mux.NewRouter()

	// Auth
	r.HandleFunc("/api/v1/auth/login", LoginHandler).Methods("POST")

	// Dashboard
	r.HandleFunc("/api/v1/metrics/dashboard", DashboardMetricsHandler).Methods("GET")
	r.HandleFunc("/api/v1/incidents", IncidentsHandler).Methods("GET")
	r.HandleFunc("/api/v1/assets/heartbeat", HeartbeatHandler).Methods("POST")

	// AI Service Mock (so frontend doesn't crash)
	r.HandleFunc("/score", AIHandler).Methods("POST")

	// Start server in background
	go func() {
		http.ListenAndServe("localhost:8080", r)
	}()

	// Start AI Mock Server on 5000
	go func() {
		http.ListenAndServe("localhost:5000", r)
	}()
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Mock login - accept anything
	json.NewEncoder(w).Encode(map[string]string{
		"token": "mock-jwt-token-for-desktop-mode",
		"user":  "admin",
	})
}

func DashboardMetricsHandler(w http.ResponseWriter, r *http.Request) {
	var processCount db.Metric
	db.DB.Where("type = ?", "process_count").Last(&processCount)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"active_threats": 0,
		"monitored_assets": 1,
		"process_count": processCount.Value,
		"security_score": 95,
	})
}

func IncidentsHandler(w http.ResponseWriter, r *http.Request) {
	var incidents []db.Incident
	db.DB.Find(&incidents)
	json.NewEncoder(w).Encode(incidents)
}

func HeartbeatHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func AIHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{
		"anomaly_score": 0.0,
		"is_anomaly": false,
	})
}
