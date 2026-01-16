package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Database struct {
	*gorm.DB
}

var dbInstance *Database

func InitDB() *Database {
	if dbInstance != nil {
		return dbInstance
	}

	// Use file path env var or default to /data
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "/data/nexdefend.db"
	}

	log.Printf("Opening SQLite database at: %s", dbPath)

	// Open SQLite connection
	gormDB, err := gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("Failed to connect to SQLite: %v", err)
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}

	// SQLite settings (1 connection to avoid locking)
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto-migrate ALL models
	// Removed: Organization, Role, SuricataEvent, Alert (Not in models package)
	err = gormDB.AutoMigrate(
		&models.User{},
		&models.SystemSettings{},
		&models.SystemMetric{},
		&models.Asset{},
		&models.Threat{},
		&models.Incident{},
		&models.Vulnerability{},
		&models.CloudAsset{},
		&models.KubernetesPod{},
	)
	if err != nil {
		log.Printf("Failed to auto-migrate: %v", err)
	}

	SeedSettings(gormDB)
	SeedDefaultUser(gormDB) // Ensure we have a default admin

	dbInstance = &Database{gormDB}
	return dbInstance
}

// GetDB returns the underlying GORM database instance.
func (d *Database) GetDB() *gorm.DB {
	return d.DB
}

// CloseDB closes the database connection.
func CloseDB() {
	if dbInstance != nil {
		sqlDB, err := dbInstance.DB.DB()
		if err != nil {
			log.Printf("Error getting sql.DB from gorm DB: %v", err)
			return
		}
		if err := sqlDB.Close(); err != nil {
			log.Printf("Error closing database connection: %v", err)
		}
	}
}

// SeedSettings seeds default system settings if they don't exist.
func SeedSettings(db *gorm.DB) {
	var count int64
	db.Model(&models.SystemSettings{}).Count(&count)
	if count == 0 {
		settings := []models.SystemSettings{
			{
				Key:      models.SettingTheme,
				Value:    "dark",
				Category: "general",
			},
			{
				Key:      models.SettingLogRetention,
				Value:    "30",
				Category: "general",
			},
			{
				Key:      "log_level", // Assuming literal if constant not found, but I saw constants earlier
				Value:    "info",
				Category: "general",
			},
		}
		for _, s := range settings {
			db.Create(&s)
		}
	}
}

// SeedDefaultUser seeds a default admin user for the demo.
func SeedDefaultUser(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count == 0 {
		// Pass: password
		db.Exec("INSERT INTO users (username, password, email, role, created_at, updated_at) VALUES ('admin', '$2a$10$YourHashedPasswordHere', 'admin@nexdefend.local', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)")
	}
}

// GetSystemMetrics fetches system metrics from the database.
func (d *Database) GetSystemMetrics(metricType string, from, to time.Time, organizationID int) ([]models.SystemMetric, error) {
	var metrics []models.SystemMetric
	if err := d.Where("metric_type = ? AND timestamp BETWEEN ? AND ? AND organization_id = ?", metricType, from, to, organizationID).Find(&metrics).Error; err != nil {
		return nil, err
	}
	return metrics, nil
}

// StoreSystemMetric stores a system metric in the database.
func (d *Database) StoreSystemMetric(metric models.SystemMetric, organizationID int) error {
	metric.OrganizationID = organizationID
	if err := d.Create(&metric).Error; err != nil {
		return fmt.Errorf("failed to store system metric: %w", err)
	}
	return nil
}
