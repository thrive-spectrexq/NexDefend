package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds the application configuration
type Config struct {
	APIPrefix          string
	PythonAPI          string
	SoarURL            string // Added SoarURL
	CORSAllowedOrigins []string
	JWTSecretKey       []byte // For user JWTs
	AIServiceToken     string // For service-to-service auth
	VirusTotalKey      string // For threat intelligence
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
		pythonAPI = "http://localhost:5000" // Use localhost for AI dev
	}

	soarURL := os.Getenv("SOAR_URL")
	if soarURL == "" {
		soarURL = "http://localhost:8082" // Default fallback (assuming SOAR is on a different port locally)
	}

	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	var allowedOrigins []string
	if corsOrigins == "" {
		allowedOrigins = []string{"http://localhost:5173"} // Default to Vite dev server
	} else {
		allowedOrigins = strings.Split(corsOrigins, ",")
	}

	jwtKey := os.Getenv("JWT_SECRET_KEY")
	if jwtKey == "" {
		jwtKey = "default_user_secret_key_12345" // Insecure, must be set in .env
		log.Println("WARNING: JWT_SECRET_KEY not set, using insecure default.")
	}

	aiToken := os.Getenv("AI_SERVICE_TOKEN")
	if aiToken == "" {
		aiToken = "default_secret_token" // Insecure, must be set in .env
		log.Println("WARNING: AI_SERVICE_TOKEN not set, using insecure default.")
	}

	vtKey := os.Getenv("VIRUSTOTAL_API_KEY")
	if vtKey == "" {
		log.Println("WARNING: VIRUSTOTAL_API_KEY not set, threat intelligence features will be limited.")
	}

	return &Config{
		APIPrefix:          apiPrefix,
		PythonAPI:          pythonAPI,
		SoarURL:            soarURL,
		CORSAllowedOrigins: allowedOrigins,
		JWTSecretKey:       []byte(jwtKey),
		AIServiceToken:     aiToken,
		VirusTotalKey:      vtKey,
	}
}
