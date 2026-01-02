
package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/thrive-spectrexq/NexDefend/internal/auth"
	"github.com/thrive-spectrexq/NexDefend/internal/cache"
	"github.com/thrive-spectrexq/NexDefend/internal/compliance"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/enrichment"
	"github.com/thrive-spectrexq/NexDefend/internal/handlers"
	"github.com/thrive-spectrexq/NexDefend/internal/logging"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/tip"
	"github.com/thrive-spectrexq/NexDefend/internal/upload"
)

// NewRouter creates and configures a new router
func NewRouter(cfg *config.Config, database *db.Database, c *cache.Cache, tip tip.TIP, adConnector enrichment.ActiveDirectoryConnector, snowConnector enrichment.ServiceNowConnector) *mux.Router {
	router := mux.NewRouter()
	router.Use(func(next http.Handler) http.Handler {
		return middleware.RateLimiter(next, 100, 200)
	})
	router.Use(logging.LogRequest)
	router.Use(middleware.ErrorHandler)
	router.Use(middleware.PrometheusMiddleware)

	// --- Public Routes ---
	router.HandleFunc("/", handlers.HomeHandler).Methods("GET")
	router.HandleFunc("/register", auth.RegisterHandler(database.GetDB(), cfg.JWTSecretKey)).Methods("POST")
	router.HandleFunc("/login", auth.LoginHandler(database.GetDB(), cfg.JWTSecretKey)).Methods("POST")

	// --- API v1 Routes (Authenticated) ---
	api := router.PathPrefix(cfg.APIPrefix).Subrouter()
	api.Use(auth.JWTMiddleware(cfg))
	api.Use(middleware.AuditLogMiddleware(database))

	// Event Viewing Route
	api.HandleFunc("/events", handlers.GetEventsHandler()).Methods("GET")

	// Agent Enrollment
	api.HandleFunc("/agents/enroll", handlers.EnrollAgentHandler()).Methods("POST")

	// TIP
	api.HandleFunc("/tip/check", handlers.CheckIOCHandler(tip)).Methods("POST")

	// Enrichment
	api.HandleFunc("/enrichment/users/{username}", handlers.GetUserHandler(adConnector)).Methods("GET")
	api.HandleFunc("/enrichment/assets/{hostname}", handlers.GetEnrichedAssetHandler(snowConnector)).Methods("GET")

	// Case Management
	api.HandleFunc("/cases", handlers.CreateCaseHandler()).Methods("POST")

	// Incident Management Routes (CRUD)
	incidentHandler := handlers.NewIncidentHandler(database.GetDB())
	api.HandleFunc("/incidents", incidentHandler.CreateIncident).Methods("POST")
	api.HandleFunc("/incidents", incidentHandler.GetIncidents).Methods("GET")
	api.HandleFunc("/incidents/{id:[0-9]+}", incidentHandler.GetIncident).Methods("GET")
	api.HandleFunc("/incidents/{id:[0-9]+}", incidentHandler.UpdateIncident).Methods("PUT")

	// Vulnerability Management Routes (CRUD)
	vulnerabilityHandler := handlers.NewVulnerabilityHandler(database.GetDB())
	api.HandleFunc("/vulnerabilities", vulnerabilityHandler.CreateVulnerability).Methods("POST")
	api.HandleFunc("/vulnerabilities", vulnerabilityHandler.GetVulnerabilities).Methods("GET")
	api.HandleFunc("/vulnerabilities/{id:[0-9]+}", vulnerabilityHandler.GetVulnerability).Methods("GET")
	api.HandleFunc("/vulnerabilities/{id:[0-9]+}", vulnerabilityHandler.UpdateVulnerability).Methods("PUT")

	// Asset Management Routes (CRUD)
	assetHandler := handlers.NewAssetHandler(database.GetDB())
	api.HandleFunc("/assets", assetHandler.CreateAsset).Methods("POST")
	api.HandleFunc("/assets", assetHandler.GetAssets).Methods("GET")
	api.HandleFunc("/assets/{id:[0-9]+}", assetHandler.GetAsset).Methods("GET")
	api.HandleFunc("/assets/{id:[0-9]+}", assetHandler.UpdateAsset).Methods("PUT")
	api.HandleFunc("/assets/{id:[0-9]+}", assetHandler.DeleteAsset).Methods("DELETE")
	api.HandleFunc("/assets/heartbeat", assetHandler.Heartbeat).Methods("POST")

	// Agent Fleet Management
	agentHandler := handlers.NewAgentHandler(database.GetDB())
	api.HandleFunc("/agent/config/{hostname}", agentHandler.GetAgentConfig).Methods("GET")
	api.HandleFunc("/agent/config", agentHandler.UpdateAgentConfig).Methods("POST")

	// File Upload & Analysis
	uploadHandler := upload.NewUploadHandler(database.GetDB())
	api.HandleFunc("/upload", uploadHandler.UploadFileHandler).Methods("POST")

	// Compliance & Reporting
	api.HandleFunc("/audit", compliance.AuditHandler).Methods("GET")
	api.HandleFunc("/reports/compliance", compliance.GenerateComplianceReport).Methods("GET")

	// System Metrics
	metricsHandler := handlers.NewMetricsHandler(database)
	api.HandleFunc("/metrics", metricsHandler.GetMetrics).Methods("GET")

	// Handlers to query Python API
	api.HandleFunc("/python-analysis", handlers.PythonAnalysisHandler(cfg)).Methods("GET")
	api.HandleFunc("/python-anomalies", handlers.PythonAnalysisHandler(cfg)).Methods("GET")

	// Cloud Credentials Management
	cloudCredentialHandler := handlers.NewCloudCredentialHandler(database.GetDB())
	api.HandleFunc("/cloud-credentials", cloudCredentialHandler.CreateCloudCredential).Methods("POST")

	// --- Admin Routes ---
	adminRoutes := api.PathPrefix("").Subrouter()
	adminRoutes.Use(middleware.RoleMiddleware("admin"))
	adminRoutes.HandleFunc("/scan", handlers.ScanHandler(cfg)).Methods("POST")
	// train and threats routes need to be updated to use a handler struct if they interact with the db
	// for now, assuming they are standalone or will be updated later
	// adminRoutes.HandleFunc("/train", ai.TrainModelHandler).Methods("POST")
	// adminRoutes.HandleFunc("/threats/ai-detect", ai.ThreatDetectionHandler).Methods("POST")

	// CORS Configuration
	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	router.Use(corsOptions.Handler)

	return router
}
