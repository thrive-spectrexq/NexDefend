package db

import (
	"os"
	"testing"
)

func TestDBConnection(t *testing.T) {
	// Set env vars for test database. In a real app, this would be a separate test DB.
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_USER", "nexdefend")
	os.Setenv("DB_PASSWORD", "password")
	os.Setenv("DB_NAME", "nexdefend_db")

	db := InitDB()
	if db == nil {
		t.Fatalf("Failed to initialize database")
	}

	sqlDB, err := db.DB.DB()
	if err != nil {
		t.Fatalf("Failed to get underlying sql.DB: %v", err)
	}

	// Defer closing the connection
	defer sqlDB.Close()

	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("Failed to ping database: %v", err)
	}
}
