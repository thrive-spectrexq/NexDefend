package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/threat" // Import the threat package

	_ "github.com/lib/pq" // PostgreSQL driver
)

type Database struct {
	conn *sql.DB
}

func (db *Database) GetDB() *sql.DB {
	return db.conn
}

var db *Database

// InitDB initializes the database connection and runs the init.sql script if tables are missing
func InitDB() *Database {
	if db != nil {
		return db // Return existing instance if already initialized
	}

	connStr := getDBConnectionString()
	conn, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	conn.SetMaxOpenConns(25)                 // Set maximum number of open connections
	conn.SetMaxIdleConns(25)                 // Set maximum number of idle connections
	conn.SetConnMaxLifetime(5 * time.Minute) // Limit connection lifetime

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

// getDBConnectionString constructs the database connection string from environment variables
func getDBConnectionString() string {
	user := getEnv("DB_USER", "nexdefend")
	password := getEnv("DB_PASSWORD", "password")
	dbName := getEnv("DB_NAME", "nexdefend_db")
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	sslMode := getEnv("DB_SSLMODE", "disable")

	return fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=%s", user, password, dbName, host, port, sslMode)
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

// getEnv retrieves environment variables with a fallback value
func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
