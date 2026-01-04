package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
    "time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/agent"
)

// StartAPIServer starts the embedded HTTP server
func StartAPIServer() {
	r := mux.NewRouter()

	// Auth
	r.HandleFunc("/api/v1/auth/login", LoginHandler).Methods("POST", "OPTIONS")
    // Register mock (same as login for now)
    r.HandleFunc("/api/v1/auth/register", LoginHandler).Methods("POST", "OPTIONS")

	// Dashboard
	r.HandleFunc("/api/v1/metrics/dashboard", DashboardMetricsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/host/details", HostDetailsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/incidents", IncidentsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/assets/heartbeat", HeartbeatHandler).Methods("POST", "OPTIONS")

	// Vulnerabilities
	r.HandleFunc("/api/v1/vulnerabilities", VulnerabilitiesHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/vulnerabilities/{id}", UpdateVulnerabilityHandler).Methods("PUT", "OPTIONS")
	r.HandleFunc("/api/v1/scan", ScanHandler).Methods("POST", "OPTIONS")

    // Settings
    r.HandleFunc("/api/v1/cloud-credentials", CloudCredentialsHandler).Methods("POST", "OPTIONS")

	// Add CORS middleware
	r.Use(mux.CORSMethodMiddleware(r))
	r.Use(corsMiddleware)

	// Start server in background
	go func() {
        if err := http.ListenAndServe("localhost:8080", r); err != nil {
            // Log error in a real app
            _ = err
        }
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

		if err := http.ListenAndServe("localhost:5000", aiRouter); err != nil {
            // Log error in a real app
            _ = err
        }
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
	var criticalIncidents int64
	var highIncidents int64
	var mediumIncidents int64
	var lowIncidents int64

	// Get latest metrics
	db.DB.Where("type = ?", "process_count").Last(&processCount)
	db.DB.Where("type = ?", "cpu_usage").Last(&cpuUsage)

	// Count open incidents by severity
	db.DB.Model(&db.Incident{}).Where("status = ?", "Open").Count(&openIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "Critical").Count(&criticalIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "High").Count(&highIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "Medium").Count(&mediumIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "Low").Count(&lowIncidents)

	// Calculate a mock security score based on incidents
	securityScore := 100 - (int(criticalIncidents)*20 + int(highIncidents)*10 + int(mediumIncidents)*5)
	if securityScore < 0 {
		securityScore = 0
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"active_threats":   openIncidents,
		"monitored_assets": 1, // Localhost
		"process_count":    processCount.Value,
		"cpu_usage":        cpuUsage.Value,
		"security_score":   securityScore,
		"severity_breakdown": map[string]int64{
			"critical": criticalIncidents,
			"high":     highIncidents,
			"medium":   mediumIncidents,
			"low":      lowIncidents,
		},
	})
}

func HostDetailsHandler(w http.ResponseWriter, r *http.Request) {
	// Fetch historical data (last 20 points)
	var cpuMetrics []db.Metric
	var memMetrics []db.Metric
	var netSentMetrics []db.Metric
	var netRecvMetrics []db.Metric

	db.DB.Where("type = ?", "cpu_usage").Order("created_at desc").Limit(20).Find(&cpuMetrics)
	db.DB.Where("type = ?", "memory_usage").Order("created_at desc").Limit(20).Find(&memMetrics)
	db.DB.Where("type = ?", "network_sent_bps").Order("created_at desc").Limit(20).Find(&netSentMetrics)
	db.DB.Where("type = ?", "network_recv_bps").Order("created_at desc").Limit(20).Find(&netRecvMetrics)

	// Reverse to chronological order
	history := make([]map[string]interface{}, 0)
	// Use CPU length as base
	length := len(cpuMetrics)
	if len(memMetrics) < length { length = len(memMetrics) }

	for i := length - 1; i >= 0; i-- {
		// Basic synchronization assumption: metrics are created in same transaction, so ids/times align closely.
		// For robustness, we just index. In production, matching by timestamp is safer.
		// Handle potential array bounds if lengths differ slightly

		item := map[string]interface{}{
			"time": cpuMetrics[i].CreatedAt.Format("15:04:05"),
			"cpu":  cpuMetrics[i].Value,
			"memory": memMetrics[i].Value,
		}

		if i < len(netSentMetrics) { item["net_sent"] = netSentMetrics[i].Value }
		if i < len(netRecvMetrics) { item["net_recv"] = netRecvMetrics[i].Value }

		history = append(history, item)
	}

	// Get Live Snapshot
	topProcs, activeConns := agent.GetLiveSnapshot()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"hostname": "LOCALHOST",
		"ip": "127.0.0.1",
		"os": "Windows 11 (Detected)",
		"status": "Online",
		"history": history,
		"processes": topProcs,
		"connections": activeConns,
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
    var anomalies []map[string]interface{}

    // 1. Static/Historical Anomalies (kept for demo)
    anomalies = append(anomalies, map[string]interface{}{
        "id": 1,
        "type": "Unusual Process Chain",
        "host": "localhost",
        "source": "UEBA Engine",
        "score": 0.88,
        "timestamp": time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
    })

    // 2. Real-time Heuristic "AI" Detection based on DB Metrics
    // Check for high CPU
    var lastCpu db.Metric
    db.DB.Where("type = ?", "cpu_usage").Last(&lastCpu)
    if lastCpu.Value > 85.0 {
        anomalies = append(anomalies, map[string]interface{}{
            "id": 2,
            "type": "Abnormal CPU Spike",
            "host": "localhost",
            "source": "Metric Analyzer",
            "score": 0.92,
            "timestamp": lastCpu.CreatedAt.Format(time.RFC3339),
        })
    }

    // Check for high Memory
    var lastMem db.Metric
    db.DB.Where("type = ?", "memory_usage").Last(&lastMem)
    if lastMem.Value > 90.0 {
        anomalies = append(anomalies, map[string]interface{}{
            "id": 3,
            "type": "Memory Exhaustion Pattern",
            "host": "localhost",
            "source": "Metric Analyzer",
            "score": 0.89,
            "timestamp": lastMem.CreatedAt.Format(time.RFC3339),
        })
    }

    // Check for Process Count Surge
    var lastProcs db.Metric
    db.DB.Where("type = ?", "process_count").Last(&lastProcs)
    if lastProcs.Value > 300 { // Arbitrary threshold for demo
         anomalies = append(anomalies, map[string]interface{}{
            "id": 4,
            "type": "Process Spawn Surge",
            "host": "localhost",
            "source": "Process Monitor",
            "score": 0.76,
            "timestamp": lastProcs.CreatedAt.Format(time.RFC3339),
        })
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
