
package models

import "time"

// Asset represents an asset in the system.
type Asset struct {
	ID        int       `json:"id"`
	Hostname  string    `json:"hostname"`
	IPAddress string    `json:"ip_address"`
	OSVersion string    `json:"os_version"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
