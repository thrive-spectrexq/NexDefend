package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/agent"
)

// Define the response structures locally since we can't easily import from the main module due to different go.mod scopes usually
// (Or ideally, you move 'models' to a shared library)
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

    // --- NEW: Parity with Cloud API ---
    r.HandleFunc("/api/v1/dashboard/stats", DesktopDashboardStatsHandler).Methods("GET", "OPTIONS")
    r.HandleFunc("/api/v1/topology", DesktopTopologyHandler).Methods("GET", "OPTIONS")
    r.HandleFunc("/api/v1/ai/chat", DesktopChatHandler).Methods("POST", "OPTIONS")

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

    // Mock host details (In a real app, this would come from agent registration info)
    hostInfo := HostInfo{
        Hostname: "FIN-WS-004", // Mock
        OS:       "Windows 11 Enterprise 22H2",
        Kernel:   "10.0.22621",
        Uptime:   12345, // Seconds
    }

	json.NewEncoder(w).Encode(map[string]interface{}{
		"hostname": hostInfo.Hostname,
		"ip": "10.20.1.45", // Mock
		"os": hostInfo.OS,
        "kernel": hostInfo.Kernel,
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

// DesktopDashboardStatsHandler - Replicates the Cloud Dashboard Handler using SQLite
func DesktopDashboardStatsHandler(w http.ResponseWriter, r *http.Request) {
    var processCount db.Metric
    db.DB.Where("type = ?", "process_count").Last(&processCount)

    // 1. Get Vulnerability Count
    var vulnCount int64
    db.DB.Model(&db.Vulnerability{}).Where("status = ?", "Open").Count(&vulnCount)

    // 2. Mock Stats for Local Context
    modules := []ModuleStat{
        {Name: "Security Events", Count: 142, Status: "healthy", Trend: "flat"}, // Low noise on single host
        {Name: "Integrity Monitoring", Count: 0, Status: "healthy", Trend: "flat"},
        {Name: "Vulnerability Detector", Count: vulnCount, Status: "warning", Trend: "up"},
        {Name: "System Auditing", Count: int64(processCount.Value), Status: "healthy", Trend: "down"},
    }

    // 3. Compliance (Local check)
    compliance := []map[string]interface{}{
        {"standard": "Local Policy", "score": 95, "status": "pass"},
        {"standard": "CIS Bench", "score": 82, "status": "pass"},
    }

    response := DashboardSummary{
        Modules:     modules,
        Compliance:  compliance,
        TotalEvents: 142,
    }

    json.NewEncoder(w).Encode(response)
}

// DesktopTopologyHandler - Scans local context to build the graph
func DesktopTopologyHandler(w http.ResponseWriter, r *http.Request) {
    // In Desktop mode, "Central Node" is THIS computer
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
        {
            "id": "gateway",
            "type": "assetNode",
            "position": map[string]int{"x": 250, "y": 50},
            "data": map[string]string{
                "label": "Gateway",
                "ip": "192.168.1.1",
                "status": "online",
                "os": "Network Device",
            },
        },
    }

    edges := []map[string]interface{}{
        {
            "id": "e1",
            "source": "gateway",
            "target": "local-machine",
            "animated": true,
            "style": map[string]string{"stroke": "#38bdf8"},
        },
    }

    // Simulate finding neighbors (In real implementation, parse `arp -a`)
    for i := 1; i <= 3; i++ {
        id := fmt.Sprintf("neighbor-%d", i)
        nodes = append(nodes, map[string]interface{}{
            "id": id,
            "type": "assetNode",
            "position": map[string]int{"x": 50 + (i*150), "y": 450},
            "data": map[string]string{
                "label": fmt.Sprintf("Device-%02d", i),
                "ip": fmt.Sprintf("192.168.1.%d", 100+i),
                "status": "offline", // Assume unmanaged
                "os": "Unknown",
            },
        })
        edges = append(edges, map[string]interface{}{
            "id": fmt.Sprintf("e-local-%d", i),
            "source": "local-machine",
            "target": id,
            "animated": false,
            "style": map[string]string{"stroke": "#5c6773"},
        })
    }

    json.NewEncoder(w).Encode(map[string]interface{}{
        "nodes": nodes,
        "edges": edges,
    })
}

// DesktopChatHandler proxies to local Ollama or falls back
func DesktopChatHandler(w http.ResponseWriter, r *http.Request) {
    // 1. Try to call Ollama (Local LLM)
    var req struct {
        Query string `json:"query"`
    }
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    ollamaReq := map[string]interface{}{
        "model": "mistral",
        "prompt": "Analyze this system log for threats: " + req.Query,
        "stream": false,
    }
    jsonData, _ := json.Marshal(ollamaReq)

    resp, err := http.Post("http://localhost:11434/api/generate", "application/json", bytes.NewBuffer(jsonData))

    if err == nil {
        defer resp.Body.Close()
        body, _ := ioutil.ReadAll(resp.Body)
        // Parse Ollama response to extract just the text if needed, or forward directly.
        // Ollama returns {"response": "..."} usually.
        // We need to match what frontend expects: {"response": "..."}
        w.Header().Set("Content-Type", "application/json")
        w.Write(body)
        return
    }

    // 2. Fallback if no local AI found
    json.NewEncoder(w).Encode(map[string]interface{}{
        "response": "Sentinel AI (Offline Mode): Ollama not detected on port 11434. Using heuristic analysis.",
    })
}

// --- AI Mock Handlers ---

func AIHandler(w http.ResponseWriter, r *http.Request) {
	// 1. Try to call Ollama (Local LLM)
    ollamaReq := map[string]interface{}{
        "model": "mistral",
        "prompt": "Analyze this system log for threats: " + r.FormValue("query"),
        "stream": false,
    }
    jsonData, _ := json.Marshal(ollamaReq)

    resp, err := http.Post("http://localhost:11434/api/generate", "application/json", bytes.NewBuffer(jsonData))

    if err == nil {
        defer resp.Body.Close()
        body, _ := ioutil.ReadAll(resp.Body)
        // Forward Ollama response
        w.Write(body)
        return
    }

    // 2. Fallback if no local AI found
	json.NewEncoder(w).Encode(map[string]interface{}{
        "response": "Sentinel AI (Offline Mode): Ollama not detected on port 11434. Using heuristic analysis.",
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
