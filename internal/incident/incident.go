package incident

import (
	"database/sql"
	"encoding/json"
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
	StatusEscalated  Status = "Escalated"
)

// Incident represents a security incident
type Incident struct {
	ID             int             `json:"id"`
	Description    string          `json:"description"`
	Severity       Severity        `json:"severity"`
	Status         Status          `json:"status"`
	AssignedTo     sql.NullString  `json:"assigned_to"`
	Notes          json.RawMessage `json:"notes"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
	RelatedEventID sql.NullInt64   `json:"related_event_id"`
	SourceIP       sql.NullString  `json:"source_ip"`
	OrganizationID int             `json:"organization_id"`
}

// CreateIncidentRequest defines the payload for creating a new incident
type CreateIncidentRequest struct {
	Description    string   `json:"description"`
	Severity       Severity `json:"severity"`
	Status         Status   `json:"status"`
	RelatedEventID *int     `json:"related_event_id,omitempty"`
	SourceIP       *string  `json:"source_ip,omitempty"`
}

// UpdateIncidentRequest defines the payload for updating an incident
type UpdateIncidentRequest struct {
	Status     *Status `json:"status,omitempty"`
	AssignedTo *string `json:"assigned_to,omitempty"`
	AddNote    *string `json:"add_note,omitempty"`
}

type DBQueryRower interface {
	QueryRow(query string, args ...interface{}) *sql.Row
}

// CreateIncident creates a new incident in the database.
func CreateIncident(db *sql.DB, req CreateIncidentRequest, organizationID int) (*Incident, error) {
	var incident Incident
	var relatedEventID sql.NullInt64
	if req.RelatedEventID != nil {
		relatedEventID = sql.NullInt64{Int64: int64(*req.RelatedEventID), Valid: true}
	}
	var sourceIP sql.NullString
	if req.SourceIP != nil {
		sourceIP = sql.NullString{String: *req.SourceIP, Valid: true}
	}

	if req.Status == "" {
		req.Status = StatusOpen
	}

	query := `
        INSERT INTO incidents (description, severity, status, related_event_id, source_ip, organization_id, created_at, updated_at, notes)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'::jsonb)
        RETURNING id, description, severity, status, assigned_to, notes, created_at, updated_at, related_event_id, source_ip, organization_id`

	err := db.QueryRow(
		query,
		req.Description,
		req.Severity,
		req.Status,
		relatedEventID,
		sourceIP,
		organizationID,
	).Scan(
		&incident.ID,
		&incident.Description,
		&incident.Severity,
		&incident.Status,
		&incident.AssignedTo,
		&incident.Notes,
		&incident.CreatedAt,
		&incident.UpdatedAt,
		&incident.RelatedEventID,
		&incident.SourceIP,
		&incident.OrganizationID,
	)

	if err != nil {
		return nil, err
	}
	return &incident, nil
}

// GetIncident retrieves a single incident by its ID.
func GetIncident(db DBQueryRower, id int, organizationID int) (*Incident, error) {
	var incident Incident
	query := `
        SELECT id, description, severity, status, assigned_to, notes, created_at, updated_at, related_event_id, organization_id
        FROM incidents
        WHERE id = $1 AND organization_id = $2`

	err := db.QueryRow(query, id, organizationID).Scan(
		&incident.ID,
		&incident.Description,
		&incident.Severity,
		&incident.Status,
		&incident.AssignedTo,
		&incident.Notes,
		&incident.CreatedAt,
		&incident.UpdatedAt,
		&incident.RelatedEventID,
		&incident.OrganizationID,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &incident, nil
}

// ListIncidents retrieves all incidents, optionally filtering by status.
func ListIncidents(db *sql.DB, status *Status, organizationID int) ([]Incident, error) {
	var rows *sql.Rows
	var err error

	query := `
        SELECT id, description, severity, status, assigned_to, notes, created_at, updated_at, related_event_id, organization_id
        FROM incidents WHERE organization_id = $1`

	if status != nil {
		query += " AND status = $2 ORDER BY created_at DESC"
		rows, err = db.Query(query, organizationID, *status)
	} else {
		query += " ORDER BY created_at DESC"
		rows, err = db.Query(query, organizationID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var incidents []Incident
	for rows.Next() {
		var incident Incident
		err := rows.Scan(
			&incident.ID,
			&incident.Description,
			&incident.Severity,
			&incident.Status,
			&incident.AssignedTo,
			&incident.Notes,
			&incident.CreatedAt,
			&incident.UpdatedAt,
			&incident.RelatedEventID,
			&incident.OrganizationID,
		)
		if err != nil {
			return nil, err
		}
		incidents = append(incidents, incident)
	}
	return incidents, nil
}

// UpdateIncident updates an existing incident.
func UpdateIncident(db *sql.DB, id int, req UpdateIncidentRequest, organizationID int) (*Incident, error) {
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	incident, err := GetIncident(tx, id, organizationID)
	if err != nil {
		return nil, err
	}
	if incident == nil {
		return nil, sql.ErrNoRows
	}

	if req.Status != nil {
		incident.Status = *req.Status
	}
	if req.AssignedTo != nil {
		incident.AssignedTo = sql.NullString{String: *req.AssignedTo, Valid: true}
	}

	if req.AddNote != nil {
		note := map[string]string{
			"text": *req.AddNote,
			"time": time.Now().UTC().Format(time.RFC3339),
		}
		noteJSON, _ := json.Marshal(note)

		query := `UPDATE incidents SET notes = notes || $1::jsonb WHERE id = $2 AND organization_id = $3 RETURNING notes`
		if err := tx.QueryRow(query, noteJSON, id, organizationID).Scan(&incident.Notes); err != nil {
			return nil, err
		}
	}

	query := `
        UPDATE incidents
        SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND organization_id = $4
        RETURNING updated_at`

	err = tx.QueryRow(query, incident.Status, incident.AssignedTo, id, organizationID).Scan(&incident.UpdatedAt)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return incident, nil
}
