package compliance

import (
	"fmt"
	"log"
	"math/rand"
	"time"
)

// ComplianceResult represents the result of a compliance check.
type ComplianceResult struct {
	CheckName string    `json:"checkName"`
	Status    string    `json:"status"`    // Pass or Fail
	Details   string    `json:"details"`   // Description of the result
	Timestamp time.Time `json:"timestamp"` // When the check was executed
}

// RunComplianceChecks executes predefined compliance checks and returns the results.
func RunComplianceChecks() []ComplianceResult {
	var results []ComplianceResult

	// Simulate compliance checks
	checks := []string{"Data Encryption", "Access Control", "Vulnerability Management", "System Patching"}

	for _, check := range checks {
		// Simulated pass/fail result with random details
		status := "Pass"
		if rand.Float64() > 0.8 { // ~20% chance of failure
			status = "Fail"
		}
		result := ComplianceResult{
			CheckName: check,
			Status:    status,
			Details:   fmt.Sprintf("Compliance check %s %sed", check, status),
			Timestamp: time.Now(),
		}
		results = append(results, result)
		logCompliance(result)
	}
	return results
}

// logCompliance logs the result of a compliance check for auditing purposes.
func logCompliance(result ComplianceResult) {
	if result.Status == "Fail" {
		log.Printf("Compliance violation detected: %s - %s", result.CheckName, result.Details)
	} else {
		log.Printf("Compliance check passed: %s", result.CheckName)
	}
}
