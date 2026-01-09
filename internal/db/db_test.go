package db

import (
	"os"
	"testing"
)

func TestDBConnection(t *testing.T) {
	if os.Getenv("CI") == "true" {
		t.Skip("Skipping DB connection test in CI environment")
	}

	// Only run this test if explicitly requested or if a DB is available.
	if os.Getenv("ENABLE_INTEGRATION_TESTS") != "true" {
		t.Skip("Skipping DB connection test. Set ENABLE_INTEGRATION_TESTS=true to run.")
	}

	// Set env vars for test database using t.Setenv for cleanup
	t.Setenv("DB_HOST", "localhost")
	t.Setenv("DB_USER", "nexdefend")
	t.Setenv("DB_PASSWORD", "password")
	t.Setenv("DB_NAME", "nexdefend_db")

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
