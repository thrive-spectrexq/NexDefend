package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/agent"
)

// --- AppHandler (New Real Data Handlers) ---

type AppHandler struct {
	ctx context.Context
}

func NewAppHandler() *AppHandler {
	return &AppHandler{}
}

func (a *AppHandler) SetContext(ctx context.Context) {
	a.ctx = ctx
}

// GetDashboardData returns real system telemetry to the UI
func (a *AppHandler) GetDashboardData() map[string]interface{} {
	stats, err := agent.GetSystemStats()
	if err != nil {
		log.Printf("Error getting stats: %v", err)
		return map[string]interface{}{"error": "Failed to fetch stats"}
	}

	return map[string]interface{}{
		"cpu":    stats.CPUUsage,
		"memory": stats.MemoryUsage,
		"disk":   stats.DiskUsage,
		"status": "Online",
	}
}

// GetProcessList returns the list of running processes
func (a *AppHandler) GetProcessList() []agent.ProcessInfo {
	procs, err := agent.GetTopProcesses(50) // Get top 50
	if err != nil {
		log.Printf("Error getting processes: %v", err)
		return []agent.ProcessInfo{}
	}
	return procs
}

// RunSecurityScan performs a basic local security check
func (a *AppHandler) RunSecurityScan() map[string]interface{} {
	// Example: Check a critical file
	hash, modified, err := agent.CheckFileIntegrity("/etc/passwd", "")

	status := "Secure"
	if err != nil {
		status = "Error reading file"
	} else if modified {
		status = "Integrity Violation Detected"
	}

	return map[string]interface{}{
		"scan_type": "Quick Local Scan",
		"timestamp": time.Now(),
		"critical_file_hash": hash,
		"status": status,
	}
}

// ScanLocalNetwork triggers the discovery process
func (a *AppHandler) ScanLocalNetwork() map[string]interface{} {
	hosts, err := agent.DiscoverLocalNetwork()
	if err != nil {
		return map[string]interface{}{
			"error": err.Error(),
			"hosts": []agent.DiscoveredHost{},
		}
	}

	return map[string]interface{}{
		"scan_time": time.Now(),
		"count":     len(hosts),
		"hosts":     hosts,
	}
}

// --- HTTP Handlers (Restored & Updated) ---

type ModuleStat struct {
	Name   string `json:"name"`
	Count  int64  `json:"count"`
	Status string `json:"status"`
	Trend  string `json:"trend"`
}

type DashboardSummary struct {
	Modules     []ModuleStat           `json:"modules"`
	Compliance  []map[string]interface{} `json:"compliance"`
	TotalEvents int64                  `json:"total_events_24h"`
}

type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type OllamaResponse struct {
	Model     string    `json:"model"`
	CreatedAt time.Time `json:"created_at"`
	Response  string    `json:"response"`
	Done      bool      `json:"done"`
}

// StartAPIServer starts the embedded HTTP server
func StartAPIServer() {
	r := mux.NewRouter()

	// Auth
	r.HandleFunc("/api/v1/auth/login", LoginHandler).Methods("POST", "OPTIONS")
    r.HandleFunc("/api/v1/auth/register", LoginHandler).Methods("POST", "OPTIONS")

	// Dashboard
	r.HandleFunc("/api/v1/metrics/dashboard", DashboardMetricsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/host/details", HostDetailsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/incidents", IncidentsHandler).Methods("GET", "OPTIONS")
	r.HandleFunc("/api/v1/assets/heartbeat", HeartbeatHandler).Methods("POST", "OPTIONS")

    // --- Parity with Cloud API ---
    r.HandleFunc("/api/v1/dashboard/stats", DesktopDashboardStatsHandler).Methods("GET", "OPTIONS")
    r.HandleFunc("/api/v1/topology", DesktopTopologyHandler).Methods("GET", "OPTIONS")
    r.HandleFunc("/api/v1/ai/chat", AIHandler).Methods("POST", "OPTIONS")

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

// Helper struct for host info
type HostInfo struct {
    Hostname string `json:"hostname"`
    OS       string `json:"os"`
    Kernel   string `json:"kernel"`
    Uptime   uint64 `json:"uptime"`
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
	json.NewEncoder(w).Encode(map[string]string{
		"token": "mock-jwt-token-for-desktop-mode",
		"user":  "admin",
	})
}

func DashboardMetricsHandler(w http.ResponseWriter, r *http.Request) {
    // Get Real Stats via Agent
    stats, err := agent.GetSystemStats()
    cpuVal := 0.0
    memVal := 0.0
    if err == nil {
        cpuVal = stats.CPUUsage
        memVal = stats.MemoryUsage
    }

	var openIncidents int64
	var criticalIncidents int64
	var highIncidents int64
	var mediumIncidents int64
	var lowIncidents int64

	// Count open incidents by severity from DB
	db.DB.Model(&db.Incident{}).Where("status = ?", "Open").Count(&openIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "Critical").Count(&criticalIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "High").Count(&highIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "Medium").Count(&mediumIncidents)
	db.DB.Model(&db.Incident{}).Where("status = ? AND severity = ?", "Open", "Low").Count(&lowIncidents)

	securityScore := 100 - (int(criticalIncidents)*20 + int(highIncidents)*10 + int(mediumIncidents)*5)
	if securityScore < 0 {
		securityScore = 0
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"active_threats":   openIncidents,
		"monitored_assets": 1,
		"process_count":    0, // Could fetch real count if needed, or leave 0 to save perf
		"cpu_usage":        cpuVal,
        "memory_usage":     memVal,
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
    // 1. Get Real Stats
    stats, _ := agent.GetSystemStats()
    // 2. Get Real Processes
    procs, _ := agent.GetTopProcesses(20)

    // Convert procs to map for JSON
    procList := make([]map[string]interface{}, 0)
    for _, p := range procs {
        procList = append(procList, map[string]interface{}{
            "pid": p.PID,
            "name": p.Name,
            "user": p.User,
            "cpu": 0.0, // Agent doesn't return per-proc CPU yet in the struct, could add later
            "status": "Running",
        })
    }

	// 3. Historical data (last 20 points from DB)
	var cpuMetrics []db.Metric
	var memMetrics []db.Metric
	db.DB.Where("type = ?", "cpu_usage").Order("created_at desc").Limit(20).Find(&cpuMetrics)
	db.DB.Where("type = ?", "memory_usage").Order("created_at desc").Limit(20).Find(&memMetrics)

	history := make([]map[string]interface{}, 0)
	length := len(cpuMetrics)
	if len(memMetrics) < length { length = len(memMetrics) }

	for i := length - 1; i >= 0; i-- {
		item := map[string]interface{}{
			"time": cpuMetrics[i].CreatedAt.Format("15:04:05"),
			"cpu":  cpuMetrics[i].Value,
			"memory": memMetrics[i].Value,
		}
		history = append(history, item)
	}

    // Mock host info (or implement real OS info fetching)
    hostInfo := HostInfo{
        Hostname: "DESKTOP-NODE",
        OS:       "Windows 11 / Linux",
        Kernel:   "Latest",
        Uptime:   12345,
    }

	json.NewEncoder(w).Encode(map[string]interface{}{
		"hostname": hostInfo.Hostname,
		"ip": "127.0.0.1",
		"os": hostInfo.OS,
        "kernel": hostInfo.Kernel,
		"status": "Online",
        "system_stats": stats, // Real stats
		"history": history,
		"processes": procList, // Real processes
		"connections": []string{}, // Placeholder
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

func VulnerabilitiesHandler(w http.ResponseWriter, r *http.Request) {
	var vulns []db.Vulnerability
	db.DB.Find(&vulns)
	json.NewEncoder(w).Encode(vulns)
}

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

func ScanHandler(w http.ResponseWriter, r *http.Request) {
    // In desktop, we could run the local integrity check
    hash, modified, _ := agent.CheckFileIntegrity("/etc/passwd", "")
    msg := fmt.Sprintf("Local Scan Complete. /etc/passwd hash: %s (Modified: %v)", hash, modified)

    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "scan complete",
        "message": msg,
    })
}

func CloudCredentialsHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "success",
    })
}

func DesktopDashboardStatsHandler(w http.ResponseWriter, r *http.Request) {
    // Real Stats integration
    stats, _ := agent.GetSystemStats()

    var vulnCount int64
    db.DB.Model(&db.Vulnerability{}).Where("status = ?", "Open").Count(&vulnCount)

    modules := []ModuleStat{
        {Name: "Security Events", Count: 0, Status: "healthy", Trend: "flat"},
        {Name: "Integrity Monitoring", Count: 0, Status: "healthy", Trend: "flat"},
        {Name: "Vulnerability Detector", Count: vulnCount, Status: "warning", Trend: "up"},
        {Name: "System Auditing", Count: int64(stats.CPUUsage), Status: "healthy", Trend: "down"}, // Using CPU as proxy for activity
    }

    compliance := []map[string]interface{}{
        {"standard": "Local Policy", "score": 95, "status": "pass"},
        {"standard": "CIS Bench", "score": 82, "status": "pass"},
    }

    response := DashboardSummary{
        Modules:     modules,
        Compliance:  compliance,
        TotalEvents: 0,
    }

    json.NewEncoder(w).Encode(response)
}

func DesktopTopologyHandler(w http.ResponseWriter, r *http.Request) {
    // Same as before
    nodes := []map[string]interface{}{
        {
            "id": "local-machine",
            "type": "assetNode",
            "position": map[string]int{"x": 250, "y": 250},
            "data": map[string]string{
                "label": "Localhost (You)",
                "ip": "127.0.0.1",
                "status": "online",
                "os": "Windows 11",
            },
        },
    }
    edges := []map[string]interface{}{}
    json.NewEncoder(w).Encode(map[string]interface{}{
        "nodes": nodes,
        "edges": edges,
    })
}

func AIHandler(w http.ResponseWriter, r *http.Request) {
	var userReq struct {
		Query string `json:"query"`
	}
	if err := json.NewDecoder(r.Body).Decode(&userReq); err != nil {
		userReq.Query = r.FormValue("query")
	}

	if userReq.Query == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"anomaly_score": 0.0,
			"is_anomaly":    false,
		})
		return
	}

	ollamaPayload := OllamaRequest{
		Model:  "phi3",
		Prompt: "You are Sentinel, an expert cybersecurity analyst for the NexDefend platform. Analyze the following system event or query and provide a concise, technical assessment of potential threats:\n\n" + userReq.Query,
		Stream: false,
	}
	jsonData, _ := json.Marshal(ollamaPayload)

	resp, err := http.Post("http://localhost:11434/api/generate", "application/json", bytes.NewBuffer(jsonData))

	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"response":      "Sentinel (Offline): Unable to contact Ollama. Please ensure 'ollama serve' is running.",
			"anomaly_score": 0.0,
		})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var ollamaResp OllamaResponse
	if err := json.Unmarshal(body, &ollamaResp); err != nil {
		http.Error(w, "Failed to parse AI response", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"response":      ollamaResp.Response,
		"anomaly_score": 0.85,
		"is_anomaly":    true,
	})
}

func AIAnomaliesHandler(w http.ResponseWriter, r *http.Request) {
    // Could use real stats to trigger anomalies
    stats, _ := agent.GetSystemStats()
    var anomalies []map[string]interface{}

    if stats.CPUUsage > 90.0 {
        anomalies = append(anomalies, map[string]interface{}{
            "id": 2,
            "type": "Abnormal CPU Spike",
            "host": "localhost",
            "source": "Metric Analyzer",
            "score": 0.95,
            "timestamp": time.Now().Format(time.RFC3339),
        })
    }

    json.NewEncoder(w).Encode(map[string]interface{}{
        "anomalies": anomalies,
    })
}

func AIMetricsHandler(w http.ResponseWriter, r *http.Request) {
    json.NewEncoder(w).Encode(map[string]interface{}{
        "events_processed": 100,
        "anomalies_detected": 0,
        "average_inference_time": "0.05ms",
    })
}

func AITrainHandler(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status": "training_started",
    })
}
