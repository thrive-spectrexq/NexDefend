package models

import "gorm.io/datatypes"

// AgentConfig represents the configuration for an agent.
type AgentConfig struct {
	ID             int            `json:"id"`
	AssetID        int            `json:"asset_id"`
	ConfigJSONB    datatypes.JSON `json:"config_jsonb"`
	OrganizationID int            `json:"organization_id"`
}

// Agent represents an agent in the system.
type Agent struct {
	ID        int    `json:"id"`
	Hostname  string `json:"hostname"`
	IPAddress string `json:"ip_address"`
	OSVersion string `json:"os_version"`
	Status    string `json:"status"`
}

// AgentEnrollmentRequest represents a request to enroll an agent.
type AgentEnrollmentRequest struct {
	Hostname  string `json:"hostname"`
	IPAddress string `json:"ip_address"`
	OSVersion string `json:"os_version"`
}
