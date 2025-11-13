
package openvas

import "log"

// Scanner defines the interface for an OpenVAS scanner.
type Scanner interface {
	Scan(target string) ([]Vulnerability, error)
}

// MockScanner is a mock implementation of the Scanner interface.
type MockScanner struct{}

// Scan performs a scan on the target.
func (s *MockScanner) Scan(target string) ([]Vulnerability, error) {
	log.Printf("Scanning target %s with OpenVAS", target)
	return []Vulnerability{
		{
			ID:          "CVE-2021-1234",
			Severity:    "High",
			Description: "Example OpenVAS vulnerability",
		},
	}, nil
}

// Vulnerability represents a vulnerability found by OpenVAS.
type Vulnerability struct {
	ID          string
	Severity    string
	Description string
}
