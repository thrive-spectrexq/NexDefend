package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds the application configuration
type Config struct {
	APIPrefix           string
	PythonAPI           string
	CORSAllowedOrigins []string
}

// LoadConfig loads the application configuration from environment variables
func LoadConfig() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found. Using system environment variables.")
	}

	apiPrefix := os.Getenv("API_PREFIX")
	if apiPrefix == "" {
		apiPrefix = "/api/v1"
	}

	pythonAPI := os.Getenv("PYTHON_API")
	if pythonAPI == "" {
		pythonAPI = "https://nexdefend-1.onrender.com"
	}

	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	var allowedOrigins []string
	if corsOrigins == "" {
		allowedOrigins = []string{"https://nexdefend.vercel.app"}
	} else {
		allowedOrigins = strings.Split(corsOrigins, ",")
	}

	return &Config{
		APIPrefix:           apiPrefix,
		PythonAPI:           pythonAPI,
		CORSAllowedOrigins: allowedOrigins,
	}
}
