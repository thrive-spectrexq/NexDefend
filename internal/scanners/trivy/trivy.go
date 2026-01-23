package trivy

import (
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"strings"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// Scanner defines the interface for a Trivy scanner.
type Scanner interface {
	Scan(target string) ([]models.Vulnerability, error)
}

// MockScanner is a mock implementation of the Scanner interface for testing.
type MockScanner struct{}

// Scan performs a mock scan.
func (s *MockScanner) Scan(target string) ([]models.Vulnerability, error) {
	return []models.Vulnerability{
		{
			Title:       "CVE-2023-1234",
			Severity:    "HIGH",
			Description: "Mock vulnerability",
			PackageName: "openssl",
			Status:      "Open",
			HostIP:      target,
			DiscoveredAt: time.Now(),
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
func (s *CLIWrapper) Scan(target string) ([]models.Vulnerability, error) {
	log.Printf("Executing Trivy scan on: %s", target)

	// Command: trivy image --format json --severity HIGH,CRITICAL [target]
	// Note: 'image' is default, but for host scan we might use 'fs' or 'repo'.
	// Assuming 'image' for container/docker targets as per context, or generic usage.
	cmd := exec.Command(s.BinaryPath, "image", "--format", "json", "--severity", "HIGH,CRITICAL", "--quiet", target)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("trivy execution failed: %v, output: %s", err, string(output))
	}

	return parseTrivyOutput(output, target)
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
			Title            string `json:"Title"`
		} `json:"Vulnerabilities"`
	} `json:"Results"`
}

func parseTrivyOutput(data []byte, target string) ([]models.Vulnerability, error) {
	var report trivyResult
	if err := json.Unmarshal(data, &report); err != nil {
		// Handle empty or malformed output gracefully
		if strings.Contains(string(data), "null") {
			return []models.Vulnerability{}, nil
		}
		return nil, fmt.Errorf("failed to parse trivy JSON: %v", err)
	}

	var vulns []models.Vulnerability
	for _, result := range report.Results {
		for _, v := range result.Vulnerabilities {
			vulns = append(vulns, models.Vulnerability{
				Title:       v.VulnerabilityID,
				Severity:    v.Severity,
				Description: v.Description,
				PackageName: v.PkgName,
				Status:      "Open",
				HostIP:      target,
				DiscoveredAt: time.Now(),
			})
		}
	}
	return vulns, nil
}
