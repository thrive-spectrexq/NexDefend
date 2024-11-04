package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
	"github.com/osquery/osquery-go"
)

var db *sql.DB
var osqueryAddress = "localhost:9000" // Update with your actual osquery server address

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
