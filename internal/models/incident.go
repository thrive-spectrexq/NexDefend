package models

import (
	"time"

	"gorm.io/datatypes"
)

// Incident represents an incident in the system.
type Incident struct {
	ID               int            `json:"id"`
	Description      string         `json:"description"`
	Severity         string         `json:"severity"`
	Status           string         `json:"status"`
	AssignedTo       string         `json:"assigned_to"`
	Notes            datatypes.JSON `json:"notes"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	RelatedEventID   int            `json:"related_event_id"`
	SourceIP         string         `json:"source_ip"`
	OrganizationID   int            `json:"organization_id"`
	ParentIncidentID int            `json:"parent_incident_id"`
	MITRE_TTP_ID     string         `json:"mitre_ttp_id"`
	RiskScore        int            `json:"risk_score"`
	EntityName       string         `json:"entity_name"`
	Disposition      string         `json:"disposition"`
}
