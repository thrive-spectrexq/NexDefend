
package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// Database struct holds the GORM DB connection.
type Database struct {
	*gorm.DB
}

var dbInstance *Database

// InitDB initializes the database connection using GORM.
func InitDB() *Database {
	if dbInstance != nil {
		return dbInstance
	}

	connStr := getDBConnectionString()
	gormDB, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database with GORM: %v", err)
	}

	sqlDB, err := gormDB.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB from GORM: %v", err)
	}

	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if err = sqlDB.Ping(); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	fmt.Println("Database connection successful!")

	// Initialize schema if tables are missing
	if !tablesExist(gormDB) {
		if err := executeSQLScript("database/init.sql", gormDB); err != nil {
			log.Fatalf("Failed to initialize the database schema: %v", err)
		}
	}

	// Auto-migrate new models that might not be in init.sql
	if err := gormDB.AutoMigrate(&models.SystemSettings{}, &models.SystemMetric{}, &models.Asset{}); err != nil {
		log.Printf("Failed to auto-migrate models: %v", err)
	}

	// Seed default settings
	SeedSettings(gormDB)

	dbInstance = &Database{gormDB}
	return dbInstance
}

func SeedSettings(db *gorm.DB) {
	defaults := []models.SystemSettings{
		{Key: models.SettingTheme, Value: "dark", Category: "general", Description: "UI Theme (dark/light)"},
		{Key: models.SettingRefreshInterval, Value: "30", Category: "general", Description: "Dashboard refresh interval in seconds"},
		{Key: models.SettingEmailEnabled, Value: "false", Category: "notifications", Description: "Enable email alerts"},
		{Key: models.SettingVirusTotalKey, Value: "", Category: "integrations", Description: "VirusTotal API Key", IsSecret: true},
		{Key: models.SettingOllamaURL, Value: "http://localhost:11434", Category: "integrations", Description: "Local Ollama Instance URL"},
	}

	for _, d := range defaults {
		var count int64
		db.Model(&models.SystemSettings{}).Where("key = ?", d.Key).Count(&count)
		if count == 0 {
			db.Create(&d)
		}
	}
}

// GetDB returns the singleton GORM database instance.
func (d *Database) GetDB() *gorm.DB {
	return d.DB
}

// getDBConnectionString constructs the database connection string from environment variables.
func getDBConnectionString() string {
	user := getEnv("DB_USER", "nexdefend")
	password := getEnv("DB_PASSWORD", "password")
	dbName := getEnv("DB_NAME", "nexdefend_db")
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	sslMode := getEnv("DB_SSLMODE", "disable")

	return fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=%s", user, password, dbName, host, port, sslMode)
}

// executeSQLScript reads and executes a SQL script file.
func executeSQLScript(filepath string, db *gorm.DB) error {
	sqlBytes, err := os.ReadFile(filepath)
	if err != nil {
		return fmt.Errorf("unable to read SQL file %s: %w", filepath, err)
	}

	if err := db.Exec(string(sqlBytes)).Error; err != nil {
		return fmt.Errorf("error executing SQL script %s: %w", filepath, err)
	}

	fmt.Println("Database schema initialized successfully!")
	return nil
}

// tablesExist checks for existing tables to avoid re-running the init.sql script.
func tablesExist(db *gorm.DB) bool {
	var exists bool
	query := `SELECT EXISTS (
		SELECT FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_name = 'suricata_events'
	);`
	if err := db.Raw(query).Scan(&exists).Error; err != nil {
		log.Fatalf("Error checking for existing tables: %v", err)
	}
	return exists
}

// CloseDB closes the database connection if it exists.
func CloseDB() {
	if dbInstance != nil {
		sqlDB, _ := dbInstance.DB.DB()
		if err := sqlDB.Close(); err != nil {
			log.Printf("Error closing the database: %v", err)
		} else {
			fmt.Println("Database connection closed successfully.")
		}
	}
}

// getEnv retrieves environment variables with a fallback value.
func getEnv(key, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
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
