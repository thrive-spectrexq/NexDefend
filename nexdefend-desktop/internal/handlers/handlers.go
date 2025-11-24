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
	r.HandleFunc("/api/v1/auth/login", LoginHandler).Methods("POST", "OPTIONS")

	// Dashboard
	r.HandleFunc("/api/v1/metrics/dashboard", DashboardMetricsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/incidents", IncidentsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/assets/heartbeat", HeartbeatHandler).Methods("POST", "OPTIONS")

	// AI Service Mock (so frontend doesn't crash)
	r.HandleFunc("/score", AIHandler).Methods("POST", "OPTIONS")

	// Add CORS middleware
	r.Use(mux.CORSMethodMiddleware(r))
	r.Use(corsMiddleware)

	// Start server in background
	go func() {
		http.ListenAndServe("localhost:8080", r)
	}()

	// Start AI Mock Server on 5000
	go func() {
		http.ListenAndServe("localhost:5000", r)
	}()
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
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
	var cpuUsage db.Metric
	var openIncidents int64

	// Get latest metrics
	db.DB.Where("type = ?", "process_count").Last(&processCount)
	db.DB.Where("type = ?", "cpu_usage").Last(&cpuUsage)

	// Count open incidents
	db.DB.Model(&db.Incident{}).Where("status = ?", "Open").Count(&openIncidents)

	// Calculate a mock security score based on incidents
	securityScore := 100 - (int(openIncidents) * 10)
	if securityScore < 0 {
		securityScore = 0
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"active_threats": openIncidents,
		"monitored_assets": 1, // Localhost
		"process_count": processCount.Value,
		"cpu_usage": cpuUsage.Value,
		"security_score": securityScore,
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
