package threat

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"
)

// Alert represents the structure of an alert in the system
type Alert struct {
	ID          int       `json:"alert_id"`
	ThreatID    int       `json:"threat_id"`
	AlertMessage string   `json:"alert_message"`
	AlertLevel   string   `json:"alert_level"`
	CreatedAt   time.Time `json:"created_at"`
}

// AlertsHandler fetches and returns alert data
func AlertsHandler(w http.ResponseWriter, r *http.Request) {
	alerts, err := FetchAlerts()
	if err != nil {
		http.Error(w, "Failed to fetch alerts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alerts)
}

// FetchAlerts retrieves alert data from the database
func FetchAlerts() ([]Alert, error) {
	var alerts []Alert

	// Replace with your actual database connection logic
	db := GetDBConnection() // Assuming GetDBConnection() returns an *sql.DB
	defer db.Close()

	query := `
		SELECT id, threat_id, alert_message, alert_level, created_at
		FROM alerts
		ORDER BY created_at DESC
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var alert Alert
		err := rows.Scan(&alert.ID, &alert.ThreatID, &alert.AlertMessage, &alert.AlertLevel, &alert.CreatedAt)
		if err != nil {
			return nil, err
		}
		alerts = append(alerts, alert)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return alerts, nil
}

// GetDBConnection retrieves the database connection
// Replace this stub with your actual database initialization logic
func GetDBConnection() *sql.DB {
	// Example placeholder: replace with your actual DB initialization
	db, err := sql.Open("postgres", "user=nexdefend password=password dbname=nexdefend_db sslmode=disable")
	if err != nil {
		panic("Failed to connect to database: " + err.Error())
	}
	return db
}
