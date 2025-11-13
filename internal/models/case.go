
package models

import "time"

// Case represents a case in the system.
type Case struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Status    string    `json:"status"`
	Assignee  string    `json:"assignee"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// CreateCaseRequest represents the request to create a case.
type CreateCaseRequest struct {
	Name     string `json:"name"`
	Assignee string `json:"assignee"`
}
