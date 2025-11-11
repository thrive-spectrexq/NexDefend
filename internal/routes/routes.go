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
	"github.com/thrive-spectrexq/NexDefend/internal/incident"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/threat"
	"github.com/thrive-spectrexq/NexDefend/internal/upload"
)

// NewRouter creates and configures a new router
func NewRouter(cfg *config.Config, database *db.Database, c *cache.Cache) *mux.Router {
	router := mux.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return middleware.RateLimiter(next, 10, 20)
	})
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)

	// Authentication Routes
	router.HandleFunc("/register", auth.RegisterHandler(database.GetDB())).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler(database.GetDB())).Methods("POST")

	// API Routes
	api := router.PathPrefix(cfg.APIPrefix).Subrouter()
	api.Use(auth.JWTMiddleware)

	api.HandleFunc("/threats", ai.ThreatDetectionHandler).Methods("POST")
	api.HandleFunc("/incident-report", incident.ReportHandler).Methods("POST")
	api.HandleFunc("/audit", compliance.AuditHandler).Methods("GET")
	api.HandleFunc("/threats", threat.ThreatsHandler(database.GetDB(), c)).Methods("GET")
	api.HandleFunc("/alerts", threat.AlertsHandler).Methods("GET")
	api.HandleFunc("/upload", upload.UploadFileHandler).Methods("POST")

	// Add handlers to query Python API
	api.HandleFunc("/python-analysis", handlers.PythonAnalysisHandler(cfg)).Methods("GET")
	api.HandleFunc("/python-anomalies", handlers.PythonAnomaliesHandler(cfg)).Methods("GET")

	// Metrics Endpoint
	api.HandleFunc("/metrics", handlers.MetricsHandler(database)).Methods("GET")

	// Home Endpoint
	router.HandleFunc("/", handlers.HomeHandler).Methods("GET")

	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	// Apply CORS middleware
	router.Use(corsOptions.Handler)

	return router
}
