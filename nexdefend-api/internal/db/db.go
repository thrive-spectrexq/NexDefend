package db

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
)

var db *sql.DB

// InitDB initializes the database connection and runs the init.sql script
func InitDB() {
	var err error
	connStr := "user=nexdefend password=password dbname=nexdefend_db sslmode=disable"
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	if err = db.Ping(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	fmt.Println("Database connection successful!")

	// Execute the init.sql script to create tables
	if err := executeSQLScript("database/init.sql"); err != nil {
		log.Fatalf("Failed to initialize the database schema: %v", err)
	}
}

// executeSQLScript reads and executes a SQL script file
func executeSQLScript(filepath string) error {
	sqlBytes, err := ioutil.ReadFile(filepath)
	if err != nil {
		return fmt.Errorf("unable to read SQL file %s: %w", filepath, err)
	}

	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		return fmt.Errorf("error executing SQL script %s: %w", filepath, err)
	}

	fmt.Println("Database schema initialized successfully!")
	return nil
}

// CloseDB closes the database connection
func CloseDB() {
	if err := db.Close(); err != nil {
		log.Fatalf("Error closing the database: %v", err)
	}
}

// GetDB returns the database instance
func GetDB() *sql.DB {
	return db
}

// CreateUser inserts a new user into the database
func CreateUser(username, password, role string) error {
	_, err := db.Exec(`INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`, username, password, role)
	if err != nil {
		return fmt.Errorf("error creating user: %v", err)
	}
	return nil
}

// GetUser retrieves a user by username
func GetUser(username string) (int, string, error) {
	var id int
	var role string
	err := db.QueryRow(`SELECT id, role FROM users WHERE username = $1`, username).Scan(&id, &role)
	if err != nil {
		return 0, "", fmt.Errorf("error retrieving user: %v", err)
	}
	return id, role, nil
}

// CreateThreat inserts a new threat into the threats table
func CreateThreat(threatType, description string, detectedAt time.Time) (int, error) {
	var id int
	err := db.QueryRow(`INSERT INTO threats (threat_type, description, detected_at) VALUES ($1, $2, $3) RETURNING id`,
		threatType, description, detectedAt).Scan(&id)
	if err != nil {
		return 0, fmt.Errorf("error creating threat: %v", err)
	}
	return id, nil
}

// GetThreats retrieves all unresolved threats
func GetThreats() ([]map[string]interface{}, error) {
	rows, err := db.Query(`SELECT id, threat_type, description, detected_at FROM threats WHERE resolved = FALSE`)
	if err != nil {
		return nil, fmt.Errorf("error retrieving threats: %v", err)
	}
	defer rows.Close()

	var threats []map[string]interface{}
	for rows.Next() {
		var id int
		var threatType, description string
		var detectedAt time.Time
		if err := rows.Scan(&id, &threatType, &description, &detectedAt); err != nil {
			return nil, fmt.Errorf("error scanning threat: %v", err)
		}
		threat := map[string]interface{}{
			"id":          id,
			"threat_type": threatType,
			"description": description,
			"detected_at": detectedAt,
		}
		threats = append(threats, threat)
	}
	return threats, nil
}

// CreateAlert adds a new alert linked to a specific threat
func CreateAlert(threatID int, message, level string) error {
	_, err := db.Exec(`INSERT INTO alerts (threat_id, alert_message, alert_level) VALUES ($1, $2, $3)`, threatID, message, level)
	if err != nil {
		return fmt.Errorf("error creating alert: %v", err)
	}
	return nil
}

// GetAlerts retrieves all alerts with optional filters
func GetAlerts() ([]map[string]interface{}, error) {
	rows, err := db.Query(`SELECT id, threat_id, alert_message, alert_level, created_at FROM alerts`)
	if err != nil {
		return nil, fmt.Errorf("error retrieving alerts: %v", err)
	}
	defer rows.Close()

	var alerts []map[string]interface{}
	for rows.Next() {
		var id, threatID int
		var message, level string
		var createdAt time.Time
		if err := rows.Scan(&id, &threatID, &message, &level, &createdAt); err != nil {
			return nil, fmt.Errorf("error scanning alert: %v", err)
		}
		alert := map[string]interface{}{
			"id":            id,
			"threat_id":     threatID,
			"alert_message": message,
			"alert_level":   level,
			"created_at":    createdAt,
		}
		alerts = append(alerts, alert)
	}
	return alerts, nil
}
