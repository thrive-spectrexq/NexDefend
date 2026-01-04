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
	"chat":      "/chat",
}

// ProxyChatHandler forwards the chat request to the Python API
func ProxyChatHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pythonURL := cfg.PythonAPI + pythonRoutes["chat"]

		// Create a new request to the Python API
		req, err := http.NewRequest(r.Method, pythonURL, r.Body)
		if err != nil {
			log.Printf("Error creating request to Python API: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		// Copy headers
		req.Header = r.Header

		// Send the request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("Error contacting Python API: %v", err)
			http.Error(w, "Failed to contact AI service", http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		// Copy response
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}
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
