package trivy

import (
	"bytes"
	"encoding/json"
	"errors"
	"os/exec"
)

// VulnerabilityResult represents a subset of Trivy's JSON output
type VulnerabilityResult struct {
	Vulnerabilities []Vulnerability `json:"Vulnerabilities"`
}

// RunScan performs a Trivy scan based on the given request
func RunScan(req ScanRequest) (ScanResult, error) {
	var result ScanResult
	result.Target = req.Target

	// Validate input
	if req.Target == "" || (req.Type != "image" && req.Type != "fs" && req.Type != "config") {
		return result, errors.New("invalid scan request: target and type must be specified")
	}

	// Build Trivy command with JSON output
	cmd := exec.Command("trivy", req.Type, req.Target, "--format", "json")

	// Capture output
	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	// Execute the command
	err := cmd.Run()
	if err != nil {
		result.Error = stderr.String()
		return result, errors.New(result.Error)
	}

	// Set raw output
	result.RawOutput = out.String()

	// Parse JSON output into structured vulnerabilities
	var vulnResults []VulnerabilityResult
	if err := json.Unmarshal(out.Bytes(), &vulnResults); err != nil {
		// If JSON parsing fails, return only raw output
		return result, nil
	}

	// Collect vulnerabilities
	for _, res := range vulnResults {
		result.Parsed = append(result.Parsed, res.Vulnerabilities...)
	}

	return result, nil
}
