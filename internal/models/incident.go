
package models

import "time"

// Incident represents an incident in the system.
type Incident struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	Severity    string    `json:"severity"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
