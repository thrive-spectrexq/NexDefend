package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/thrive-spectrexq/NexDefend/internal/ai"
	"github.com/thrive-spectrexq/NexDefend/internal/auth"
	"github.com/thrive-spectrexq/NexDefend/internal/cache"
	"github.com/thrive-spectrexq/NexDefend/internal/compliance"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/handlers"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/upload"
)

// NewRouter creates and configures a new router
func NewRouter(cfg *config.Config, database *db.Database, c *cache.Cache) *mux.Router {
	router := mux.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		// Fixed non-breaking space
		return middleware.RateLimiter(next, 100, 200)
	})
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)

	// --- Public Routes ---
	router.HandleFunc("/", handlers.HomeHandler).Methods("GET")
	// Pass the JWT key from config to the handlers
	router.HandleFunc("/register", auth.RegisterHandler(database.GetDB(), cfg.JWTSecretKey)).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler(database.GetDB(), cfg.JWTSecretKey)).Methods("POST")

	// --- API v1 Routes (Authenticated) ---
	api := router.PathPrefix(cfg.APIPrefix).Subrouter()
	// Pass the config to the JWT middleware
	api.Use(auth.JWTMiddleware(cfg))

	// Event Viewing Route
	api.HandleFunc("/events", handlers.GetEventsHandler()).Methods("GET")

	// Incident Management Routes (CRUD)
	api.HandleFunc("/incidents", handlers.CreateIncidentHandler(database.GetDB())).Methods("POST")
	api.HandleFunc("/incidents", handlers.ListIncidentsHandler(database.GetDB())).Methods("GET")
	api.HandleFunc("/incidents/{id:[0-9]+}", handlers.GetIncidentHandler(database.GetDB())).Methods("GET")
	api.HandleFunc("/incidents/{id:[0-9]+}", handlers.UpdateIncidentHandler(database.GetDB())).Methods("PUT")

	// Vulnerability Management Routes (CRUD)
	api.HandleFunc("/vulnerabilities", handlers.CreateVulnerabilityHandler(database.GetDB())).Methods("POST")
	api.HandleFunc("/vulnerabilities", handlers.ListVulnerabilitiesHandler(database.GetDB())).Methods("GET")
	api.HandleFunc("/vulnerabilities/{id:[0-9]+}", handlers.GetVulnerabilityHandler(database.GetDB())).Methods("GET")
	api.HandleFunc("/vulnerabilities/{id:[0-9]+}", handlers.UpdateVulnerabilityHandler(database.GetDB())).Methods("PUT")

	// File Upload & Analysis
	api.HandleFunc("/upload", upload.UploadFileHandler).Methods("POST")

	// Compliance & Reporting
	api.HandleFunc("/audit", compliance.AuditHandler).Methods("GET")
	api.HandleFunc("/reports/compliance", compliance.GenerateComplianceReport).Methods("GET")

	// System Metrics
	api.HandleFunc("/metrics", handlers.MetricsHandler(database)).Methods("GET")

	api.HandleFunc("/threats/ai-detect", ai.ThreatDetectionHandler).Methods("POST") // Fixed non-breaking space

	// Handlers to query Python API
	api.HandleFunc("/python-analysis", handlers.PythonAnalysisHandler(cfg)).Methods("GET")
	api.HandleFunc("/python-anomalies", handlers.PythonAnalysisHandler(cfg)).Methods("GET")

	// --- NEW SCAN ROUTE ADDED ---
	api.HandleFunc("/scan", handlers.ScanHandler(cfg)).Methods("POST")


	// CORS Configuration
	corsOptions := cors.New(cors.Options{
		// Fixed non-breaking spaces
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	router.Use(corsOptions.Handler)

	return router
}
