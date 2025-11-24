package db

import (
	"log"
	"os"
	"path/filepath"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// Incident represents a security incident in the local DB
type Incident struct {
	gorm.Model
	Title       string
	Severity    string
	Description string
	Status      string
}

// Metric represents a time-series data point
type Metric struct {
	gorm.Model
	Type  string
	Value float64
}

func InitDB() {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatal("Failed to get user home dir:", err)
	}

	dbPath := filepath.Join(homeDir, ".nexdefend", "nexdefend.db")
	err = os.MkdirAll(filepath.Dir(dbPath), 0755)
	if err != nil {
		log.Fatal("Failed to create db directory:", err)
	}

	db, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto Migrate
	err = db.AutoMigrate(&Incident{}, &Metric{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
}
