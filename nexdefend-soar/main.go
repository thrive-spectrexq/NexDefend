package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/remediation"
)

type WebhookRequest struct {
	AlertID     string `json:"alert_id"`
	AlertType   string `json:"alert_type"`
	SourceIP    string `json:"source_ip"`
	Description string `json:"description"`
}

var executor *remediation.ActionExecutor

func main() {
	executor = remediation.NewActionExecutor()

	r := mux.NewRouter()
	r.HandleFunc("/health", healthCheck).Methods("GET")
	r.HandleFunc("/webhook/trigger", handleTrigger).Methods("POST")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // Default SOAR port
	}

	log.Printf("🔥 NexDefend SOAR Engine starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}

func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("SOAR Engine Active"))
}

func handleTrigger(w http.ResponseWriter, r *http.Request) {
	var req WebhookRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	log.Printf("Received Trigger: %s from %s", req.AlertType, req.SourceIP)

	// Simple Hardcoded Logic for Demo (In real life, this would read playbooks.yml)
	// If it's a critical threat or brute force, block the IP.
	if req.AlertType == "SSH Brute Force" || req.AlertType == "Malware C&C" {
		go func() {
			err := executor.ExecuteAction("block_ip", req.SourceIP)
			if err != nil {
				log.Printf("Failed to execute remediation: %v", err)
			}
		}()
		w.Write([]byte(`{"status": "executing_remediation", "action": "block_ip"}`))
	} else {
		w.Write([]byte(`{"status": "logged", "action": "none"}`))
	}
}
