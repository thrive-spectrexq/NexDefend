package reports

import (
	"encoding/json"
	"net/http"
)

// ReportData holds the structure for threat reports
type ReportData struct {
	ThreatName string `json:"threat_name"`
	Severity   string `json:"severity"`
	Details    string `json:"details"`
}

// GenerateThreatReport generates a detailed report of the detected threats
func GenerateThreatReport(w http.ResponseWriter, r *http.Request) {
	// Sample report data (this would be dynamically generated)
	report := ReportData{
		ThreatName: "SQL Injection",
		Severity:   "High",
		Details:    "Detected potential SQL injection in system logs.",
	}

	// Set response type as JSON
	w.Header().Set("Content-Type", "application/json")

	// Send back the report as JSON
	json.NewEncoder(w).Encode(report)
}
