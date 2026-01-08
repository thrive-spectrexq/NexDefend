package trivy

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"strings"
)

// Scanner defines the interface for a Trivy scanner.
type Scanner interface {
	Scan(target string) ([]Vulnerability, error)
}

// MockScanner is a mock implementation of the Scanner interface for testing.
type MockScanner struct{}

// Scan performs a mock scan.
func (s *MockScanner) Scan(target string) ([]Vulnerability, error) {
	return []Vulnerability{
		{
			ID:          "CVE-2023-1234",
			Severity:    "HIGH",
			Description: "Mock vulnerability",
			Package:     "openssl",
			FixedIn:     "3.0.0",
		},
	}, nil
}

// CLIWrapper implements Scanner using the installed Trivy CLI
type CLIWrapper struct {
	BinaryPath string
}

func NewScanner() *CLIWrapper {
	// Assumes trivy is installed in $PATH
	return &CLIWrapper{BinaryPath: "trivy"}
}

// Scan performs a real scan using the Trivy CLI
func (s *CLIWrapper) Scan(target string) ([]Vulnerability, error) {
	log.Printf("Executing Trivy scan on: %s", target)

	// Command: trivy image --format json --severity HIGH,CRITICAL [target]
	cmd := exec.Command(s.BinaryPath, "image", "--format", "json", "--severity", "HIGH,CRITICAL", "--quiet", target)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("trivy execution failed: %v, output: %s", err, string(output))
	}

	return parseTrivyOutput(output)
}

// Internal structures for parsing Trivy JSON
type trivyResult struct {
	Results []struct {
		Vulnerabilities []struct {
			VulnerabilityID  string `json:"VulnerabilityID"`
			PkgName          string `json:"PkgName"`
			Severity         string `json:"Severity"`
			Description      string `json:"Description"`
			FixedVersion     string `json:"FixedVersion"`
		} `json:"Vulnerabilities"`
	} `json:"Results"`
}

// Vulnerability represents a normalized finding
type Vulnerability struct {
	ID          string
	Severity    string
	Description string
	Package     string
	FixedIn     string
}

func parseTrivyOutput(data []byte) ([]Vulnerability, error) {
	var report trivyResult
	if err := json.Unmarshal(data, &report); err != nil {
		// Handle empty or malformed output gracefully
		if strings.Contains(string(data), "null") {
			return []Vulnerability{}, nil
		}
		return nil, fmt.Errorf("failed to parse trivy JSON: %v", err)
	}

	var vulns []Vulnerability
	for _, result := range report.Results {
		for _, v := range result.Vulnerabilities {
			vulns = append(vulns, Vulnerability{
				ID:          v.VulnerabilityID,
				Severity:    v.Severity,
				Description: v.Description,
				Package:     v.PkgName,
				FixedIn:     v.FixedVersion,
			})
		}
	}
	return vulns, nil
}
