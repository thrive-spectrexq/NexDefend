package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
    "time"

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

	// Vulnerabilities
	r.HandleFunc("/api/v1/vulnerabilities", VulnerabilitiesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/vulnerabilities/{id}", UpdateVulnerabilityHandler).Methods("PUT", "OPTIONS")
	r.HandleFunc("/api/v1/scan", ScanHandler).Methods("POST", "OPTIONS")

    // Settings
    r.HandleFunc("/api/v1/cloud-credentials", CloudCredentialsHandler).Methods("POST", "OPTIONS")

	// AI Service Mock (so frontend doesn't crash)
	// These run on port 5000 in the separate goroutine below, but we can reuse the handler functions if we wanted.
    // However, the AI mock server needs its own router.

	// Add CORS middleware
	r.Use(mux.CORSMethodMiddleware(r))
	r.Use(corsMiddleware)

	// Start server in background
	go func() {
		http.ListenAndServe("localhost:8080", r)
	}()

	// Start AI Mock Server on 5000
	go func() {
        aiRouter := mux.NewRouter()
        aiRouter.HandleFunc("/score", AIHandler).Methods("POST", "OPTIONS")
        aiRouter.HandleFunc("/anomalies", AIAnomaliesHandler).Methods("GET", "OPTIONS")
        aiRouter.HandleFunc("/api-metrics", AIMetricsHandler).Methods("GET", "OPTIONS")
        aiRouter.HandleFunc("/train", AITrainHandler).Methods("POST", "OPTIONS")

        aiRouter.Use(mux.CORSMethodMiddleware(aiRouter))
        aiRouter.Use(corsMiddleware)

		http.ListenAndServe("localhost:5000", aiRouter)
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

// VulnerabilitiesHandler returns list of vulnerabilities
func VulnerabilitiesHandler(w http.ResponseWriter, r *http.Request) {
	var vulns []db.Vulnerability
	db.DB.Find(&vulns)
	json.NewEncoder(w).Encode(vulns)
}

// UpdateVulnerabilityHandler updates the status of a vulnerability
func UpdateVulnerabilityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var vuln db.Vulnerability
	if result := db.DB.First(&vuln, id); result.Error != nil {
		http.Error(w, "Vulnerability not found", http.StatusNotFound)
		return
	}

	vuln.Status = req.Status
	db.DB.Save(&vuln)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(vuln)
}

// ScanHandler simulates a network scan
func ScanHandler(w http.ResponseWriter, r *http.Request) {
    // In a real app, this would trigger a background job.
    // Here we just sleep briefly and mock success.
    time.Sleep(1 * time.Second)

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "scan initiated",
        "message": "Scan completed successfully (simulated)",
    })
}

// CloudCredentialsHandler handles cloud credentials submission
func CloudCredentialsHandler(w http.ResponseWriter, r *http.Request) {
    // Just mock success, don't actually store them in this demo
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "success",
    })
}

// --- AI Mock Handlers ---

func AIHandler(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{
		"anomaly_score": 0.0,
		"is_anomaly": false,
	})
}

func AIAnomaliesHandler(w http.ResponseWriter, r *http.Request) {
    // Return some mock anomalies
    anomalies := []map[string]interface{}{
        {
            "id": 1,
            "type": "Unusual Process",
            "host": "localhost",
            "source": "Process Monitor",
            "score": 0.85,
            "timestamp": time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
        },
    }
    json.NewEncoder(w).Encode(map[string]interface{}{
        "anomalies": anomalies,
    })
}

func AIMetricsHandler(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]interface{}{
        "events_processed": 15420,
        "anomalies_detected": 12,
        "average_inference_time": "0.05ms",
    })
}

func AITrainHandler(w http.ResponseWriter, r *http.Request) {
    // Mock training trigger
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "training_started",
    })
}
