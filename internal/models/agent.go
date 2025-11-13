
package models

import "time"

// Agent represents an agent in the system.
type Agent struct {
	ID        int       `json:"id"`
	Hostname  string    `json:"hostname"`
	IPAddress string    `json:"ip_address"`
	OSVersion string    `json:"os_version"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// AgentEnrollmentRequest represents the request to enroll an agent.
type AgentEnrollmentRequest struct {
	Hostname  string `json:"hostname"`
	IPAddress string `json:"ip_address"`
	OSVersion string `json:"os_version"`
}
