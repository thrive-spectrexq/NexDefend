package db

import (
	"github.com/thrive-spectrexq/NexDefend/internal/threat"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/osquery/osquery-go"
)

type Database struct {
	conn *sql.DB
}

var db *sql.DB
var osqueryAddress = "/var/osquery/shell.em" // Updated for Unix socket

// InitDB initializes the database connection and runs the init.sql script if tables are missing
func InitDB() *Database {
	var err error
	connStr := "user=nexdefend password=password dbname=nexdefend_db sslmode=disable"
	conn, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to connect to the database: %v\n", err)
		os.Exit(1)
	}

	if err = conn.Ping(); err != nil {
		fmt.Fprintf(os.Stderr, "Database connection failed: %v\n", err)
		os.Exit(1)
	}

	fmt.Println("Database connection successful!")

	// Check if tables already exist to avoid re-initializing the schema
	if !tablesExist(conn) {
		if err := executeSQLScript("database/init.sql", conn); err != nil {
			fmt.Fprintf(os.Stderr, "Failed to initialize the database schema: %v\n", err)
			os.Exit(1)
		}
	}

	return &Database{conn: conn}
}

// executeSQLScript reads and executes a SQL script file
func executeSQLScript(filepath string, db *sql.DB) error {
	sqlBytes, err := os.ReadFile(filepath)
	if err != nil {
		return fmt.Errorf("unable to read SQL file %s: %w", filepath, err)
	}

	_, err = db.Exec(string(sqlBytes)) // Use the provided db connection
	if err != nil {
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
		AND table_name = 'users'
	);`
	err := conn.QueryRow(query).Scan(&exists) // Use the provided db connection
	if err != nil {
		log.Fatalf("Error checking for existing tables: %v", err)
	}
	return exists
}

// CloseDB closes the database connection
func CloseDB() {
	if err := db.Close(); err != nil {
		fmt.Fprintf(os.Stderr, "Error closing the database: %v\n", err)
	}
}

// GetDB returns the database instance
func GetDB() *sql.DB {
	return db
}

// RunOsquery executes an osquery query and stores results in the database
func RunOsquery(query string) ([]map[string]interface{}, error) {
	client, err := osquery.NewClient(osqueryAddress, 5*time.Second)
	if err != nil {
		return nil, fmt.Errorf("error connecting to osquery: %v", err)
	}
	defer client.Close()

	// Run the query
	resp, err := client.Query(query)
	if err != nil {
		return nil, fmt.Errorf("error executing osquery: %v", err)
	}

	// Prepare to store results in the database
	results := make([]map[string]interface{}, len(resp.Response))
	for i, row := range resp.Response {
		// Convert the ExtensionPluginResponse to a map
		resultMap := make(map[string]interface{})
		for key, value := range row {
			resultMap[key] = value
		}
		results[i] = resultMap

		if err := storeOsqueryResult(query, row); err != nil {
			log.Printf("error storing osquery result: %v", err)
		}
	}

	return results, nil
}

// storeOsqueryResult stores a single osquery result in the database
func storeOsqueryResult(query string, row map[string]string) error {
	// Convert map to JSON for storage
	rowJSON, err := json.Marshal(row)
	if err != nil {
		return fmt.Errorf("error marshaling row to JSON: %v", err)
	}

	_, err = db.Exec(`INSERT INTO osquery_results (query, result, executed_at) VALUES ($1, $2, $3)`, query, string(rowJSON), time.Now())
	if err != nil {
		return fmt.Errorf("error inserting osquery result: %v", err)
	}
	return nil
}

// Implement the StoreSuricataEvent method to store Suricata events in the database
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
