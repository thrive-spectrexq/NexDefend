package models

import (
	"time"

	"gorm.io/gorm"
)

// Alert represents a high-level alert generated from events.
type Alert struct {
	gorm.Model
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Severity    string    `json:"severity"` // low, medium, high, critical
	Status      string    `json:"status"`   // new, acknowledged, resolved
	Source      string    `json:"source"`   // e.g., "Suricata", "Host Agent"
	ArtifactID  string    `json:"artifact_id"` // ID of the related event (e.g. Suricata ID)
	DetectedAt  time.Time `json:"detected_at"`
	ResolvedAt  *time.Time `json:"resolved_at"`
	AssignedTo  string    `json:"assigned_to"`
}
