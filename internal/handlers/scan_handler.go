package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/scanners/trivy"
	"gorm.io/gorm"
)

type ScanHandler struct {
	db      *gorm.DB
	scanner trivy.Scanner
}

type ScanRequest struct {
	Target string `json:"target"`
}

func NewScanHandler(db *gorm.DB) *ScanHandler {
	return &ScanHandler{
		db:      db,
		scanner: trivy.NewScanner(), // In production, we might inject this or use a factory
	}
}

func (h *ScanHandler) StartScan(w http.ResponseWriter, r *http.Request) {
	var req ScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Target == "" {
		http.Error(w, "Target is required", http.StatusBadRequest)
		return
	}

	// Trigger async scan
	go h.runScan(req.Target)

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "scan_started",
		"message": "Vulnerability scan initiated for " + req.Target,
	})
}

func (h *ScanHandler) runScan(target string) {
	log.Printf("Starting vulnerability scan for target: %s", target)

	vulns, err := h.scanner.Scan(target)
	if err != nil {
		log.Printf("Scan failed for %s: %v", target, err)
		return
	}

	log.Printf("Scan completed for %s. Found %d vulnerabilities.", target, len(vulns))

	// Save results to DB
	for _, v := range vulns {
		v.UpdatedAt = time.Now()
		// Upsert logic could be added here to avoid duplicates,
		// but simple Create is fine for this iteration.
		if err := h.db.Create(&v).Error; err != nil {
			log.Printf("Failed to save vulnerability %s: %v", v.Title, err)
		}
	}
}
