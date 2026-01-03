package models

import "time"

// Asset represents an asset in the system.
type Asset struct {
	ID             int       `json:"id"`
	Hostname       string    `json:"hostname" gorm:"index"`
	IPAddress      string    `json:"ip_address"`
	OSVersion      string    `json:"os_version"`
	MACAddress     string    `json:"mac_address"`
	AgentVersion   string    `json:"agent_version"`
	Status         string    `json:"status"`
	LastHeartbeat  time.Time `json:"last_heartbeat"`
	Criticality    string    `json:"criticality"`
	OrganizationID int       `json:"organization_id"`
}
