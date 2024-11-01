package compliance

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// ComplianceReport represents a summary report of compliance checks.
type ComplianceReport struct {
	ReportID    string             `json:"reportID"`
	Results     []ComplianceResult `json:"results"`
	GeneratedAt time.Time          `json:"generatedAt"`
}

// GenerateComplianceReport creates a report summarizing the compliance check results.
func GenerateComplianceReport(w http.ResponseWriter, r *http.Request) {
	results := RunComplianceChecks() // Run compliance checks
	report := ComplianceReport{
		ReportID:    fmt.Sprintf("report-%d", time.Now().Unix()),
		Results:     results,
		GeneratedAt: time.Now(),
	}

	// Respond with the JSON report
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(report); err != nil {
		http.Error(w, "Failed to generate compliance report", http.StatusInternalServerError)
		log.Printf("Error encoding compliance report: %v", err)
		return
	}
	log.Printf("Compliance report generated with ReportID: %s", report.ReportID)
}
