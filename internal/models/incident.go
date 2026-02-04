package models

import (
	"time"

	"gorm.io/datatypes"
)

// Incident represents an incident in the system.
type Incident struct {
	ID               int            `json:"id"`
	Description      string         `json:"description" validate:"required,min=5,max=500"`
	Severity         string         `json:"severity" validate:"required,oneof=Low Medium High Critical"`
	Status           string         `json:"status" validate:"omitempty,oneof=Open InProgress Resolved Closed"`
	AssignedTo       string         `json:"assigned_to" validate:"omitempty,max=100"`
	Notes            datatypes.JSON `json:"notes"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	RelatedEventID   int            `json:"related_event_id"`
	SourceIP         string         `json:"source_ip" validate:"omitempty,ip"`
	OrganizationID   int            `json:"organization_id"`
	ParentIncidentID int            `json:"parent_incident_id"`
	MITRE_TTP_ID     string         `json:"mitre_ttp_id" validate:"omitempty,max=50"`
	RiskScore        int            `json:"risk_score" validate:"min=0,max=100"`
	EntityName       string         `json:"entity_name" validate:"omitempty,max=200"`
	Disposition      string         `json:"disposition" validate:"omitempty,oneof=TruePositive FalsePositive"`
}
