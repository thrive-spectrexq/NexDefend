package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/cache"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/enrichment"
	"github.com/thrive-spectrexq/NexDefend/internal/handlers"
	"github.com/thrive-spectrexq/NexDefend/internal/middleware"
	"github.com/thrive-spectrexq/NexDefend/internal/search"
	"github.com/thrive-spectrexq/NexDefend/internal/tip"
	"github.com/rs/cors"
)

func NewRouter(
	cfg *config.Config,
	database *db.Database,
	c *cache.Cache,
	tip tip.TIP, // FIX: Removed '*' (Use interface directly, not pointer to interface)
	adConnector enrichment.ActiveDirectoryConnector,
	snowConnector enrichment.ServiceNowConnector,
	osClient *search.Client,
) *mux.Router {

	r := mux.NewRouter()

	r.Use(middleware.LoggingMiddleware)

	// Initialize Handlers
	homeHandler := handlers.NewHomeHandler()
	authHandler := handlers.NewAuthHandler(database.GetDB(), cfg.JWTSecretKey)
	agentHandler := handlers.NewAgentHandler(database.GetDB())
	eventHandler := handlers.NewEventHandler(osClient)
	assetHandler := handlers.NewAssetHandler(database.GetDB())
	vulnHandler := handlers.NewVulnerabilityHandler(database.GetDB())
	incidentHandler := handlers.NewIncidentHandler(database.GetDB())
	caseHandler := handlers.NewCaseManagementHandler(database.GetDB())
	settingsHandler := handlers.NewSettingsHandler(database.GetDB())
	metricsHandler := handlers.NewMetricsHandler(database)
	scanHandler := handlers.NewScanHandler()
	hostHandler := handlers.NewHostHandler(database.GetDB())

	// Proxies
	chatHandler := handlers.NewProxyChatHandler(cfg.PythonAPI, cfg.AIServiceToken)
	dashboardStatsHandler := handlers.NewGetDashboardStatsHandler(database.GetDB(), osClient)
	topologyHandler := handlers.NewTopologyHandler(osClient)
	processTreeHandler := handlers.NewProcessTreeHandler(cfg.PythonAPI)
	networkHandler := handlers.NewNetworkStatsHandler(osClient)
	soarHandler := handlers.NewSoarProxyHandler(cfg.SoarURL)
	tipHandler := handlers.NewTIPHandler(tip) // Initialize TIP Handler

	// Health Check
	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// API V1 Subrouter
	api := r.PathPrefix("/api/v1").Subrouter()

	// Public Routes
	api.HandleFunc("/", homeHandler.Home).Methods("GET")
	api.HandleFunc("/auth/login", authHandler.Login).Methods("POST", "OPTIONS")
	api.HandleFunc("/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	api.HandleFunc("/ai/{endpoint}", handlers.ProxyToPython).Methods("GET", "POST")

	// Agent & Ingestion
	api.HandleFunc("/agent/config/{hostname}", agentHandler.GetConfig).Methods("GET")
	api.HandleFunc("/assets/heartbeat", assetHandler.Heartbeat).Methods("POST")
	api.HandleFunc("/events", eventHandler.IngestEvent).Methods("POST")

	// Protected Routes
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(cfg.JWTSecretKey))

	// Dashboard & Stats
	protected.HandleFunc("/dashboard/stats", dashboardStatsHandler.GetStats).Methods("GET")
	protected.HandleFunc("/topology", topologyHandler.GetTopology).Methods("GET")
	protected.HandleFunc("/dashboard/network/traffic", networkHandler.GetNetworkTraffic).Methods("GET")
	protected.HandleFunc("/dashboard/network/protocols", networkHandler.GetProtocolDistribution).Methods("GET")

	// Assets
	protected.HandleFunc("/assets", assetHandler.GetAssets).Methods("GET")
	protected.HandleFunc("/assets", assetHandler.CreateAsset).Methods("POST")
	protected.HandleFunc("/assets/cloud", assetHandler.GetCloudAssets).Methods("GET")
	protected.HandleFunc("/assets/kubernetes", assetHandler.GetKubernetesPods).Methods("GET")
	protected.HandleFunc("/assets/sync", assetHandler.TriggerSync).Methods("POST")
	protected.HandleFunc("/assets/{id}", assetHandler.GetAsset).Methods("GET")
	protected.HandleFunc("/assets/{id}", assetHandler.UpdateAsset).Methods("PUT")
	protected.HandleFunc("/assets/{id}", assetHandler.DeleteAsset).Methods("DELETE")
	protected.HandleFunc("/assets/{id}/details", hostHandler.GetHostDetails).Methods("GET")

	// Incidents
	protected.HandleFunc("/incidents", incidentHandler.GetIncidents).Methods("GET")
	protected.HandleFunc("/incidents", incidentHandler.CreateIncident).Methods("POST")
	protected.HandleFunc("/incidents/{id}", incidentHandler.GetIncident).Methods("GET")
	protected.HandleFunc("/incidents/{id}", incidentHandler.UpdateIncident).Methods("PUT")

	// Alerts
	protected.HandleFunc("/alerts", func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query()
		q.Add("type", "alert")
		r.URL.RawQuery = q.Encode()
		eventHandler.GetEvents(w, r)
	}).Methods("GET")

	// Threat Intelligence
	protected.HandleFunc("/threat/check", tipHandler.CheckIOC).Methods("GET")

	// SOAR Playbooks
	protected.HandleFunc("/playbooks", soarHandler.ProxyRequest).Methods("GET", "POST")
	protected.HandleFunc("/playbooks/{id}", soarHandler.ProxyRequest).Methods("GET", "PUT", "DELETE")

	// Analysis
	protected.HandleFunc("/analysis/process-tree", processTreeHandler.AnalyzeProcessTree).Methods("POST")

	// Events
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

	// Cases
	protected.HandleFunc("/cases", caseHandler.GetCases).Methods("GET")
	protected.HandleFunc("/cases", caseHandler.CreateCase).Methods("POST")

	// User Profile
	protected.HandleFunc("/auth/profile", authHandler.GetProfile).Methods("GET")
	protected.HandleFunc("/auth/profile", authHandler.UpdateProfile).Methods("PUT")

	return r
}
