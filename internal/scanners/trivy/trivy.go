
package trivy

import "log"

// Scanner defines the interface for a Trivy scanner.
type Scanner interface {
	Scan(target string) ([]Vulnerability, error)
}

// MockScanner is a mock implementation of the Scanner interface.
type MockScanner struct{}

// Scan performs a scan on the target.
func (s *MockScanner) Scan(target string) ([]Vulnerability, error) {
	log.Printf("Scanning target %s with Trivy", target)
	return []Vulnerability{
		{
			ID:          "CVE-2021-5678",
			Severity:    "Medium",
			Description: "Example Trivy vulnerability",
		},
	}, nil
}

// Vulnerability represents a vulnerability found by Trivy.
type Vulnerability struct {
	ID          string
	Severity    string
	Description string
}
