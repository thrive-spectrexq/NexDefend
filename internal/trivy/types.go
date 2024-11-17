package trivy

// ScanRequest defines the input for a Trivy scan
type ScanRequest struct {
	Target string `json:"target" validate:"required"` // Target to scan (e.g., container image, filesystem path)
	Type   string `json:"type" validate:"required,oneof=image fs config"` // Scan type (e.g., "image", "fs", "config")
}

// ScanResult holds the results of a Trivy scan
type ScanResult struct {
	Target   string       `json:"target"`   // The scan target
	RawOutput string       `json:"raw_output"` // The raw output of the Trivy scan
	Parsed   []Vulnerability `json:"parsed,omitempty"` // Parsed vulnerabilities (if applicable)
	Error    string       `json:"error"`    // Any errors encountered during the scan
}

// Vulnerability represents a single vulnerability or issue detected
type Vulnerability struct {
	ID          string `json:"id"`          // Unique identifier for the vulnerability
	Description string `json:"description"` // A brief description of the issue
	Severity    string `json:"severity"`    // Severity level (e.g., "Low", "Medium", "High", "Critical")
	Package     string `json:"package"`     // The affected package or component
	Version     string `json:"version"`     // The affected version
	FixedIn     string `json:"fixed_in,omitempty"` // Version in which the vulnerability is fixed (if available)
}
