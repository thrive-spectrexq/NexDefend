package dashboard

import "time"

type Dashboard struct {
	Threats          []Threat          `json:"threats"`
	Vulnerabilities  []Vulnerability  `json:"vulnerabilities"`
	ComplianceStatus ComplianceStatus `json:"compliance_status"`
	SystemMetrics    SystemMetrics    `json:"system_metrics"`
}

type Threat struct {
	ID        string    `json:"id"`
	Signature string    `json:"signature"`
	Timestamp time.Time `json:"timestamp"`
	Severity  int       `json:"severity"`
}

type Vulnerability struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
	HostIP      string `json:"host_ip,omitempty"`
	Port        int    `json:"port,omitempty"`
}

type ComplianceStatus struct {
	Compliant bool   `json:"compliant"`
	Details   string `json:"details"`
}

type SystemMetrics struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
	DiskUsage   float64 `json:"disk_usage"`
}
