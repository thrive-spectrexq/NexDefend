package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/config"
)

var pythonRoutes = map[string]string{
	"analysis":  "/analysis",
	"anomalies": "/anomalies",
}

// PythonAnalysisHandler fetches analysis results from the Python API
func PythonAnalysisHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		results := fetchPythonResults(cfg.PythonAPI, pythonRoutes["analysis"])
		if results == nil {
			http.Error(w, "Failed to fetch analysis results", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}

// PythonAnomaliesHandler fetches anomaly results from the Python API
func PythonAnomaliesHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		results := fetchPythonResults(cfg.PythonAPI, pythonRoutes["anomalies"])
		if results == nil {
			http.Error(w, "Failed to fetch anomaly results", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}

// fetchPythonResults queries the Python API for specific endpoint results
func fetchPythonResults(pythonAPI, endpoint string) map[string]interface{} {
	resp, err := http.Get(pythonAPI + endpoint)
	if err != nil {
		log.Printf("Error fetching Python API results (%s): %v", endpoint, err)
		return nil
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading Python API response (%s): %v", endpoint, err)
		return nil
	}

	var results map[string]interface{}
	if err := json.Unmarshal(body, &results); err != nil {
		log.Printf("Error unmarshaling Python API response (%s): %v", endpoint, err)
		return nil
	}

	return results
}
