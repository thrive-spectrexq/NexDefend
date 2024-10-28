package db

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"

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

	err = db.Ping()
	if err != nil {
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
		return fmt.Errorf("unable to read SQL file: %v", err)
	}

	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		return fmt.Errorf("error executing SQL script: %v", err)
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
