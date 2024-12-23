package threat

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

// Threat represents a structured threat entity
type Threat struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	Severity    string    `json:"severity"`
	Timestamp   time.Time `json:"timestamp"`
	SourceIP    string    `json:"source_ip"`
	Destination string    `json:"destination"`
	EventType   string    `json:"event_type"`
}

// ThreatsHandler fetches and returns threat data
func ThreatsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Parse optional query parameters for filtering
		severity := r.URL.Query().Get("severity")
		startTime := r.URL.Query().Get("start_time")
		endTime := r.URL.Query().Get("end_time")
		limitStr := r.URL.Query().Get("limit")
		limit := 50 // Default limit
		if limitStr != "" {
			if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
				limit = parsedLimit
			}
		}

		// Fetch threats from the database
		threats, err := FetchThreats(db, severity, startTime, endTime, limit)
		if err != nil {
			http.Error(w, "Failed to fetch threats", http.StatusInternalServerError)
			return
		}

		// Respond with JSON-encoded threats
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(threats)
	}
}

// FetchThreats retrieves threat data from the database
func FetchThreats(db *sql.DB, severity, startTime, endTime string, limit int) ([]Threat, error) {
	query := "SELECT id, description, severity, timestamp, source_ip, destination, event_type FROM threats WHERE 1=1"
	args := []interface{}{}

	// Add severity filter
	if severity != "" {
		query += " AND severity = $1"
		args = append(args, severity)
	}

	// Add timestamp range filter
	if startTime != "" {
		query += " AND timestamp >= $2"
		args = append(args, startTime)
	}
	if endTime != "" {
		query += " AND timestamp <= $3"
		args = append(args, endTime)
	}

	// Add limit
	query += " ORDER BY timestamp DESC LIMIT $4"
	args = append(args, limit)

	// Execute query
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Parse results
	var threats []Threat
	for rows.Next() {
		var threat Threat
		if err := rows.Scan(&threat.ID, &threat.Description, &threat.Severity, &threat.Timestamp, &threat.SourceIP, &threat.Destination, &threat.EventType); err != nil {
			return nil, err
		}
		threats = append(threats, threat)
	}

	return threats, nil
}
