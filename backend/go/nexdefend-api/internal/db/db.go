package db

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // PostgreSQL driver
)

var db *sql.DB

// InitDB initializes the database connection
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
