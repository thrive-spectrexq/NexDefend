package dashboard

import (
	"encoding/json"
	"net/http"
	"time"
)

func GetDashboardData(w http.ResponseWriter, r *http.Request) {
	dashboardData := Dashboard{
		Threats: []Threat{
			{ID: "1", Signature: "ET SCAN Potential SSH Scan", Timestamp: time.Now(), Severity: 1},
			{ID: "2", Signature: "ET POLICY TCP Telnet Connection detected", Timestamp: time.Now(), Severity: 2},
		},
		Vulnerabilities: []Vulnerability{
			{ID: "VULN-001", Description: "Outdated OpenSSL version", Severity: "High"},
			{ID: "VULN-002", Description: "SQL Injection vulnerability in login form", Severity: "Critical"},
		},
		ComplianceStatus: ComplianceStatus{
			Compliant: true,
			Details:   "All systems compliant with CIS benchmarks.",
		},
		SystemMetrics: SystemMetrics{
			CPUUsage:    45.5,
			MemoryUsage: 60.2,
			DiskUsage:   75.0,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(dashboardData)
}
