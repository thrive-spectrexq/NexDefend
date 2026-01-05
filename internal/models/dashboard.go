package models

type ModuleStat struct {
	Name   string `json:"name"`
	Count  int64  `json:"count"`
	Status string `json:"status"` // "critical", "warning", "healthy"
	Trend  string `json:"trend"`  // "up", "down", "flat"
}

type ComplianceScore struct {
	Standard string `json:"standard"` // e.g., "PCI-DSS"
	Score    int    `json:"score"`    // 0-100
	Status   string `json:"status"`   // "pass", "fail"
}

type DashboardSummary struct {
	Modules    []ModuleStat      `json:"modules"`
	Compliance []ComplianceScore `json:"compliance"`
	TotalEvents int64            `json:"total_events_24h"`
}
