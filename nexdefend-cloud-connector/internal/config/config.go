
package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds the application configuration
type Config struct {
	KafkaTopic            string
	AWS_ACCESS_KEY_ID     string
	AWS_SECRET_ACCESS_KEY string
	AWS_REGION            string
	S3_BUCKET_NAME        string
	AZURE_CONNECTION_STRING string
	AZURE_EVENT_HUB_NAME    string
	GCP_PROJECT_ID        string
	GCP_SUBSCRIPTION_ID   string
}

// LoadConfig loads the configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	return &Config{
		KafkaTopic:            getEnv("KAFKA_TOPIC", "cloud-logs"),
		AWS_ACCESS_KEY_ID:     getEnv("AWS_ACCESS_KEY_ID", ""),
		AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY", ""),
		AWS_REGION:            getEnv("AWS_REGION", "us-east-1"),
		S3_BUCKET_NAME:        getEnv("S3_BUCKET_NAME", ""),
		AZURE_CONNECTION_STRING: getEnv("AZURE_CONNECTION_STRING", ""),
		AZURE_EVENT_HUB_NAME:    getEnv("AZURE_EVENT_HUB_NAME", ""),
		GCP_PROJECT_ID:        getEnv("GCP_PROJECT_ID", ""),
		GCP_SUBSCRIPTION_ID:   getEnv("GCP_SUBSCRIPTION_ID", ""),
	}
}

// Helper function to get an environment variable or return a default value
func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
