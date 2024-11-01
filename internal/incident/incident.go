package incident

import (
	"errors"
	"fmt"
	"log"
	"sync"
	"time"
)

// Severity levels for incidents
type Severity string

const (
	SeverityLow      Severity = "Low"
	SeverityMedium   Severity = "Medium"
	SeverityHigh     Severity = "High"
	SeverityCritical Severity = "Critical"
)

// Status represents the current state of an incident
type Status string

const (
	StatusOpen       Status = "Open"
	StatusInProgress Status = "In Progress"
	StatusResolved   Status = "Resolved"
)

// Incident represents a security incident with details and tracking info.
type Incident struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	Severity    Severity  `json:"severity"`
	Status      Status    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// IncidentManager manages a list of incidents with thread safety.
type IncidentManager struct {
	incidents map[int]*Incident
	mu        sync.Mutex
	nextID    int
}

// NewIncidentManager initializes a new IncidentManager instance.
func NewIncidentManager() *IncidentManager {
	return &IncidentManager{
		incidents: make(map[int]*Incident),
		nextID:    1,
	}
}

// CreateIncident creates a new incident and adds it to the manager.
func (m *IncidentManager) CreateIncident(description string, severity Severity) (*Incident, error) {
	if description == "" {
		return nil, errors.New("incident description cannot be empty")
	}
	if severity != SeverityLow && severity != SeverityMedium && severity != SeverityHigh && severity != SeverityCritical {
		return nil, errors.New("invalid severity level")
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	incident := &Incident{
		ID:          m.nextID,
		Description: description,
		Severity:    severity,
		Status:      StatusOpen,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.incidents[incident.ID] = incident
	m.nextID++

	log.Printf("New incident created: %+v", incident)
	return incident, nil
}

// GetIncident retrieves an incident by its ID.
func (m *IncidentManager) GetIncident(id int) (*Incident, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	incident, exists := m.incidents[id]
	if !exists {
		return nil, fmt.Errorf("incident with ID %d not found", id)
	}
	return incident, nil
}

// UpdateIncidentStatus updates the status of an incident.
func (m *IncidentManager) UpdateIncidentStatus(id int, status Status) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	incident, exists := m.incidents[id]
	if !exists {
		return fmt.Errorf("incident with ID %d not found", id)
	}

	incident.Status = status
	incident.UpdatedAt = time.Now()

	log.Printf("Incident status updated: %+v", incident)
	return nil
}

// ListIncidents returns all incidents, optionally filtering by status.
func (m *IncidentManager) ListIncidents(status *Status) []*Incident {
	m.mu.Lock()
	defer m.mu.Unlock()

	var incidents []*Incident
	for _, incident := range m.incidents {
		if status == nil || incident.Status == *status {
			incidents = append(incidents, incident)
		}
	}
	return incidents
}

// ResolveIncident marks an incident as resolved and updates the status and timestamp.
func (m *IncidentManager) ResolveIncident(id int) error {
	return m.UpdateIncidentStatus(id, StatusResolved)
}
