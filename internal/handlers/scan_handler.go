package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/config"
)

type ScanRequest struct {
	Target string `json:"target"`
}

// ScanHandler proxies a vulnerability scan request to the Python AI service.
func ScanHandler(cfg *config.Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req ScanRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}
		if req.Target == "" {
			http.Error(w, "Target is required", http.StatusBadRequest)
			return
		}

		// Marshal the request to send to Python
		jsonBody, err := json.Marshal(req)
		if err != nil {
			log.Printf("Error marshalling scan request: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Create the request to the Python service
		scanURL := cfg.PythonAPI + "/scan"
		pyReq, err := http.NewRequest("POST", scanURL, bytes.NewBuffer(jsonBody))
		if err != nil {
			log.Printf("Error creating Python scan request: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Add service-to-service auth
		pyReq.Header.Set("Authorization", "Bearer "+cfg.AIServiceToken)
		pyReq.Header.Set("Content-Type", "application/json")

		// Execute the request
		client := &http.Client{}
		resp, err := client.Do(pyReq)
		if err != nil {
			log.Printf("Error calling Python scan service: %v", err)
			http.Error(w, "Scan service is unavailable", http.StatusServiceUnavailable)
			return
		}
		defer resp.Body.Close()

		// Proxy the response headers and status code
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(resp.StatusCode)

		// Copy the body from the Python service response to our response
		if _, err := io.Copy(w, resp.Body); err != nil {
			log.Printf("Error writing scan response: %v", err)
		}
	}
}
