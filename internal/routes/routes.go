
package routes

import (
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/enrichment"
	"github.com/thrive-spectrexq/NexDefend/internal/handlers"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/search"
	"github.com/thrive-spectrexq/NexDefend/internal/tip"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"github.com/thrive-spectrexq/NexDefend/internal/cache"
)

// NewRouter creates a new Mux router with all routes defined
func NewRouter(
	cfg *config.Config,
	database *db.Database,
	c *cache.Cache,
	tip *tip.TIP,
	adConnector enrichment.ActiveDirectoryConnector,
	snowConnector enrichment.ServiceNowConnector,
	osClient *search.Client,
) *mux.Router {

	r := mux.NewRouter()

	// Initialize Handlers
	homeHandler := handlers.NewHomeHandler()
	authHandler := handlers.NewAuthHandler(database.GetDB(), cfg.JWTSecretKey)
	agentHandler := handlers.NewAgentHandler(database.GetDB())
	eventHandler := handlers.NewEventHandler(osClient)
	assetHandler := handlers.NewAssetHandler(database.GetDB())
	vulnHandler := handlers.NewVulnerabilityHandler(database.GetDB())
	// Updated IncidentHandler initialization to match existing signature (just DB)
	// If enrichment is needed, update the handler or pass it here. The existing one in memory only takes DB.
	incidentHandler := handlers.NewIncidentHandler(database.GetDB())
	caseHandler := handlers.NewCaseManagementHandler(database.GetDB())
	settingsHandler := handlers.NewSettingsHandler(database.GetDB())
	metricsHandler := handlers.NewMetricsHandler(database)
	scanHandler := handlers.NewScanHandler()
	// Config struct uses PythonAPI not PythonAPIURL
	chatHandler := handlers.NewProxyChatHandler(cfg.PythonAPI, cfg.AIServiceToken)
	dashboardStatsHandler := handlers.NewGetDashboardStatsHandler(database.GetDB(), osClient)
	topologyHandler := handlers.NewTopologyHandler(osClient)
	processTreeHandler := handlers.NewProcessTreeHandler(cfg.PythonAPI) // New Handler

	// API V1 Subrouter
	api := r.PathPrefix("/api/v1").Subrouter()

	// Middleware
	api.Use(middleware.LoggingMiddleware)

	// Public Routes
	api.HandleFunc("/", homeHandler.Home).Methods("GET")
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST")
	api.HandleFunc("/auth/register", authHandler.Register).Methods("POST")
	api.HandleFunc("/agent/config/{hostname}", agentHandler.GetConfig).Methods("GET")
	api.HandleFunc("/assets/heartbeat", assetHandler.Heartbeat).Methods("POST") // Agent heartbeat
	api.HandleFunc("/events", eventHandler.IngestEvent).Methods("POST") // Direct ingest

	// Protected Routes (Apply Auth Middleware)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecretKey))

	// Dashboard & Stats
	protected.HandleFunc("/dashboard/stats", dashboardStatsHandler.GetStats).Methods("GET")
	protected.HandleFunc("/topology", topologyHandler.GetTopology).Methods("GET")

	// Assets
	protected.HandleFunc("/assets", assetHandler.GetAssets).Methods("GET")
	protected.HandleFunc("/assets", assetHandler.CreateAsset).Methods("POST")
	protected.HandleFunc("/assets/cloud", assetHandler.GetCloudAssets).Methods("GET") // New
	protected.HandleFunc("/assets/kubernetes", assetHandler.GetKubernetesPods).Methods("GET") // New
	protected.HandleFunc("/assets/{id}", assetHandler.GetAsset).Methods("GET")
	protected.HandleFunc("/assets/{id}", assetHandler.UpdateAsset).Methods("PUT")
	protected.HandleFunc("/assets/{id}", assetHandler.DeleteAsset).Methods("DELETE")

	// Incidents
	protected.HandleFunc("/incidents", incidentHandler.GetIncidents).Methods("GET")
	protected.HandleFunc("/incidents", incidentHandler.CreateIncident).Methods("POST")
	protected.HandleFunc("/incidents/{id}", incidentHandler.GetIncident).Methods("GET")
	protected.HandleFunc("/incidents/{id}", incidentHandler.UpdateIncident).Methods("PUT")
	// AssignIncident endpoint seems missing in handler, removing it for now or check handler
	// protected.HandleFunc("/incidents/{id}/assign", incidentHandler.AssignIncident).Methods("POST")

	// Analysis
	protected.HandleFunc("/analysis/process-tree", processTreeHandler.AnalyzeProcessTree).Methods("POST") // New

	// Events (Search)
	protected.HandleFunc("/events/search", eventHandler.GetEvents).Methods("GET")

	// Vulnerabilities
	protected.HandleFunc("/vulnerabilities", vulnHandler.GetVulnerabilities).Methods("GET")
	protected.HandleFunc("/vulnerabilities", vulnHandler.CreateVulnerability).Methods("POST")

	// AI & Chat
	protected.HandleFunc("/ai/chat", chatHandler.ProxyChat).Methods("POST")
	protected.HandleFunc("/scans", scanHandler.StartScan).Methods("POST")

	// Settings
	protected.HandleFunc("/settings", settingsHandler.GetSettings).Methods("GET")
	protected.HandleFunc("/settings", settingsHandler.UpdateSettings).Methods("POST")

	// Metrics
	protected.HandleFunc("/metrics/system", metricsHandler.GetSystemMetrics).Methods("GET")

	// Cases (SOAR)
	protected.HandleFunc("/cases", caseHandler.GetCases).Methods("GET")
	protected.HandleFunc("/cases", caseHandler.CreateCase).Methods("POST")

	// CORS Handler
	cWrapper := cors.New(cors.Options{
		AllowedOrigins:   cfg.CORSAllowedOrigins, // Fixed field name
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	r.Use(cWrapper.Handler)

	return r
}
