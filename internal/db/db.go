package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/thrive-spectrexq/NexDefend/internal/threat"
)

type Database struct {
	conn *sql.DB
}

var db *Database

// InitDB initializes the database connection and runs the init.sql script if tables are missing
func InitDB() *Database {
	if db != nil {
		return db // Return existing instance if already initialized
	}

	connStr := "user=nexdefend password=password dbname=nexdefend_db sslmode=disable"
	conn, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	if err = conn.Ping(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	fmt.Println("Database connection successful!")

	// Initialize schema if tables are missing
	if !tablesExist(conn) {
		if err := executeSQLScript("database/init.sql", conn); err != nil {
			log.Fatalf("Failed to initialize the database schema: %v", err)
		}
	}

	db = &Database{conn: conn}
	return db
}

// executeSQLScript reads and executes a SQL script file
func executeSQLScript(filepath string, db *sql.DB) error {
	sqlBytes, err := os.ReadFile(filepath)
	if err != nil {
		return fmt.Errorf("unable to read SQL file %s: %w", filepath, err)
	}

	if _, err = db.Exec(string(sqlBytes)); err != nil {
		return fmt.Errorf("error executing SQL script %s: %w", filepath, err)
	}

	fmt.Println("Database schema initialized successfully!")
	return nil
}

// tablesExist checks for existing tables to avoid re-running the init.sql script
func tablesExist(conn *sql.DB) bool {
	var exists bool
	query := `SELECT EXISTS (
		SELECT FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_name = 'suricata_events'
	);`
	if err := conn.QueryRow(query).Scan(&exists); err != nil {
		log.Fatalf("Error checking for existing tables: %v", err)
	}
	return exists
}

// CloseDB closes the database connection if it exists
func CloseDB() {
	if db != nil && db.conn != nil {
		if err := db.conn.Close(); err != nil {
			log.Printf("Error closing the database: %v", err)
		} else {
			fmt.Println("Database connection closed successfully.")
		}
	}
}

// GetDB returns the singleton database instance
func GetDB() *sql.DB {
	if db == nil {
		log.Fatal("Database has not been initialized. Call InitDB() first.")
	}
	return db.conn
}

// StoreSuricataEvent stores Suricata events in the database
func (db *Database) StoreSuricataEvent(event threat.SuricataEvent) error {
	_, err := db.conn.Exec(
		`INSERT INTO suricata_events (timestamp, event_type, http, tls, dns, alert)
         VALUES ($1, $2, $3, $4, $5, $6)`,
		event.Timestamp,
		event.EventType,
		jsonValue(event.HTTP),
		jsonValue(event.TLS),
		jsonValue(event.DNS),
		jsonValue(event.Alert),
	)
	if err != nil {
		return fmt.Errorf("error storing Suricata event: %v", err)
	}
	return nil
}

// jsonValue marshals structs into JSON for storage
func jsonValue(data interface{}) interface{} {
	if data == nil {
		return nil
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Printf("Error marshaling data to JSON: %v", err)
		return nil
	}
	return jsonData
}
