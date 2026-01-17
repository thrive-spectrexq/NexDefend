package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/driver/postgres"
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

	var gormDB *gorm.DB
	var err error

	// DUAL-MODE SWITCH
	dbType := os.Getenv("DB_TYPE")

	if dbType == "postgres" {
		log.Println("--- ENTERPRISE MODE: Connecting to PostgreSQL ---")
		dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
			getEnv("DB_HOST", "localhost"),
			getEnv("DB_USER", "nexdefend"),
			getEnv("DB_PASSWORD", "nexdefend"),
			getEnv("DB_NAME", "nexdefend"),
			getEnv("DB_PORT", "5432"),
		)
		gormDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
	} else {
		// Default to SQLite (Demo Mode)
		dbPath := getEnv("DB_PATH", "/data/nexdefend.db")
		log.Printf("--- DEMO MODE: Connecting to SQLite at %s ---", dbPath)
		gormDB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
	}

	if err != nil {
		log.Fatalf("Failed to connect to database (%s): %v", dbType, err)
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}

	// Tweak connection pool based on mode
	if dbType == "postgres" {
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetConnMaxLifetime(time.Hour)
	} else {
		sqlDB.SetMaxOpenConns(1)
		sqlDB.SetMaxIdleConns(1)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	// Unified Schema Migration
	log.Println("Running AutoMigrate...")
	err = gormDB.AutoMigrate(
		&models.User{},
		&models.Organization{}, &models.Role{},
		&models.SystemSettings{}, &models.SystemMetric{}, &models.Asset{},
		&models.SuricataEvent{},
		&models.Threat{},
		&models.Alert{},
		&models.Incident{}, &models.Vulnerability{}, &models.CloudAsset{}, &models.KubernetesPod{},
	)
	if err != nil {
		log.Printf("Migration Warning: %v", err)
	}

	SeedSettings(gormDB)
	SeedDefaultUser(gormDB)

	dbInstance = &Database{gormDB}
	return dbInstance
}

func GetDB() *gorm.DB {
	if dbInstance == nil {
		return InitDB().DB
	}
	return dbInstance.DB
}

func CloseDB() {
	if dbInstance != nil {
		sqlDB, _ := dbInstance.DB.DB()
		sqlDB.Close()
	}
}

// getEnv retrieves an environment variable or returns a default value.
func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
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
