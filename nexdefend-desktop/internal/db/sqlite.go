package db

import (
	"log"
	"os"
	"path/filepath"
	"time"
    "database/sql"

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

// Vulnerability represents a security vulnerability
type Vulnerability struct {
	ID           uint           `gorm:"primarykey" json:"id"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Description  string         `json:"description"`
	Severity     string         `json:"severity"`
	Status       string         `json:"status"`
	HostIP       sql.NullString `json:"host_ip"`
	Port         sql.NullInt32  `json:"port"`
	DiscoveredAt time.Time      `json:"discovered_at"`
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
	err = db.AutoMigrate(&Incident{}, &Metric{}, &Vulnerability{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db

    // Seed some initial vulnerability data if empty
    var count int64
    DB.Model(&Vulnerability{}).Count(&count)
    if count == 0 {
        DB.Create(&Vulnerability{
            Description:  "Open SSH Port (22)",
            Severity:     "Medium",
            Status:       "Detected",
            HostIP:       sql.NullString{String: "127.0.0.1", Valid: true},
            Port:         sql.NullInt32{Int32: 22, Valid: true},
            DiscoveredAt: time.Now(),
        })
    }
}
