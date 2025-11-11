package incident

import (
	"database/sql"
	"encoding/json"
	"time"
	// "github.com/lib/pq" // Removed: Unused import
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

// Incident represents a security incident with details and tracking info.
type Incident struct {
	ID             int             `json:"id"`
	Description    string          `json:"description"`
	Severity       Severity        `json:"severity"`
	Status         Status          `json:"status"`
	AssignedTo     sql.NullString  `json:"assigned_to"`
	Notes          json.RawMessage `json:"notes"` // Use json.RawMessage for JSONB
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
	RelatedEventID sql.NullInt64   `json:"related_event_id"`
}

// CreateIncidentRequest defines the payload for creating a new incident
type CreateIncidentRequest struct {
	Description    string   `json:"description"`
	Severity       Severity `json:"severity"`
	Status         Status   `json:"status"`
	RelatedEventID *int     `json:"related_event_id,omitempty"`
}

// UpdateIncidentRequest defines the payload for updating an incident
type UpdateIncidentRequest struct {
	Status     *Status `json:"status,omitempty"`
	AssignedTo *string `json:"assigned_to,omitempty"`
	AddNote    *string `json:"add_note,omitempty"` // Field to add a new note
}

// --- NEW: DBQueryRower interface ---
// This interface is implemented by both *sql.DB and *sql.Tx
type DBQueryRower interface {
	QueryRow(query string, args ...interface{}) *sql.Row
}

// CreateIncident creates a new incident in the database.
func CreateIncident(db *sql.DB, req CreateIncidentRequest) (*Incident, error) {
	var incident Incident
	var relatedEventID sql.NullInt64
	if req.RelatedEventID != nil {
		relatedEventID = sql.NullInt64{Int64: int64(*req.RelatedEventID), Valid: true}
	}

	if req.Status == "" {
		req.Status = StatusOpen // Default status
	}

	query := `
        INSERT INTO incidents (description, severity, status, related_event_id, created_at, updated_at, notes)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '[]'::jsonb)
        RETURNING id, description, severity, status, assigned_to, notes, created_at, updated_at, related_event_id`

	err := db.QueryRow(
		query,
		req.Description,
		req.Severity,
		req.Status,
		relatedEventID,
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
	)

	if err != nil {
		return nil, err
	}
	return &incident, nil
}

// GetIncident retrieves a single incident by its ID.
// --- UPDATED: Accepts the DBQueryRower interface ---
func GetIncident(db DBQueryRower, id int) (*Incident, error) {
	var incident Incident
	query := `
        SELECT id, description, severity, status, assigned_to, notes, created_at, updated_at, related_event_id
        FROM incidents
        WHERE id = $1`

	err := db.QueryRow(query, id).Scan(
		&incident.ID,
		&incident.Description,
		&incident.Severity,
		&incident.Status,
		&incident.AssignedTo,
		&incident.Notes,
		&incident.CreatedAt,
		&incident.UpdatedAt,
		&incident.RelatedEventID,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found is not a server error
		}
		return nil, err
	}
	return &incident, nil
}

// ListIncidents retrieves all incidents, optionally filtering by status.
func ListIncidents(db *sql.DB, status *Status) ([]Incident, error) {
	var rows *sql.Rows
	var err error

	query := `
        SELECT id, description, severity, status, assigned_to, notes, created_at, updated_at, related_event_id
        FROM incidents`

	if status != nil {
		query += " WHERE status = $1 ORDER BY created_at DESC"
		rows, err = db.Query(query, *status)
	} else {
		query += " ORDER BY created_at DESC"
		rows, err = db.Query(query)
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
		)
		if err != nil {
			return nil, err // Handle scan error
		}
		incidents = append(incidents, incident)
	}
	return incidents, nil
}

// UpdateIncident updates an existing incident's status, assignee, or adds a note.
func UpdateIncident(db *sql.DB, id int, req UpdateIncidentRequest) (*Incident, error) {
	// Start a transaction
	tx, err := db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback() // Rollback if not committed

	// 1. Get current incident data
	// --- UPDATED: Now correctly passes the transaction (tx) ---
	incident, err := GetIncident(tx, id)
	if err != nil {
		return nil, err
	}
	if incident == nil {
		return nil, sql.ErrNoRows // Or a custom not found error
	}

	// 2. Apply updates
	if req.Status != nil {
		incident.Status = *req.Status
	}
	if req.AssignedTo != nil {
		incident.AssignedTo = sql.NullString{String: *req.AssignedTo, Valid: true}
	}

	// 3. Handle adding a note (JSONB append)
	if req.AddNote != nil {
		// Create a simple note object
		note := map[string]string{
			"text": *req.AddNote,
			"time": time.Now().UTC().Format(time.RFC3339),
			// We can add user info here later from JWT context
		}
		noteJSON, _ := json.Marshal(note)

		// Append the new note to the existing JSONB array
		query := `UPDATE incidents SET notes = notes || $1::jsonb WHERE id = $2 RETURNING notes`
		if err := tx.QueryRow(query, noteJSON, id).Scan(&incident.Notes); err != nil {
			return nil, err
		}
	}

	// 4. Commit all other updates
	query := `
        UPDATE incidents
        SET status = $1, assigned_to = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING updated_at`

	err = tx.QueryRow(query, incident.Status, incident.AssignedTo, id).Scan(&incident.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// 5. Commit the transaction
	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return incident, nil
}
