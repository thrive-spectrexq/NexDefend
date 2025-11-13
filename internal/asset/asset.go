package asset

import (
	"database/sql"
)

type Asset struct {
	ID             int            `json:"id"`
	Hostname       string         `json:"hostname"`
	IPAddress      sql.NullString `json:"ip_address"`
	OSVersion      sql.NullString `json:"os_version"`
	MACAddress     sql.NullString `json:"mac_address"`
	AgentVersion   sql.NullString `json:"agent_version"`
	Status         sql.NullString `json:"status"`
	LastHeartbeat  sql.NullTime   `json:"last_heartbeat"`
	Criticality    sql.NullString `json:"criticality"`
	OrganizationID int            `json:"organization_id"`
}
