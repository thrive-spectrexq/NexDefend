package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/hyperseek"
)

type ThreatHandler struct {
	service *hyperseek.Service
}

func NewThreatHandler(service *hyperseek.Service) *ThreatHandler {
	return &ThreatHandler{
		service: service,
	}
}

type ThreatScanRequest struct {
	Payload string `json:"payload"`
}

type ThreatScanResponse struct {
	Score           float32 `json:"score"`
	ThreatLevel     string  `json:"threat_level"`
	MatchedPatterns string  `json:"matched_patterns"`
	Analysis        string  `json:"analysis"`
	Entropy         float32 `json:"entropy"`
}

func (h *ThreatHandler) ScanPayload(w http.ResponseWriter, r *http.Request) {
	var req ThreatScanRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	score, matches, entropy := h.service.AnalyzePayload(req.Payload)

	level := "LOW"
	if score > 75.0 {
		level = "CRITICAL"
	} else if score > 50.0 {
		level = "HIGH"
	} else if score > 20.0 {
		level = "MEDIUM"
	}

	analysis := "No analysis required."

	// If threat is high, ask Python AI for verification
	if score > 50.0 {
		// Prepare request to Python AI
		aiReq := map[string]interface{}{
			"payload":  req.Payload,
			"patterns": matches,
			"score":    score,
			"entropy":  entropy,
		}
		jsonData, _ := json.Marshal(aiReq)

		// Ideally use a config for the URL, hardcoded for now to match api.py default
		// The internal config usually has PythonAPI URL
		resp, err := http.Post("http://localhost:5000/verify-threat", "application/json", bytes.NewBuffer(jsonData))
		if err == nil {
			defer resp.Body.Close()
			var aiResp struct {
				Analysis string `json:"analysis"`
				Error    string `json:"error"`
			}
			if json.NewDecoder(resp.Body).Decode(&aiResp) == nil {
				if aiResp.Error != "" {
					analysis = "AI Error: " + aiResp.Error
				} else {
					analysis = aiResp.Analysis
				}
			}
		} else {
			analysis = "AI Unreachable"
		}
	}

	resp := ThreatScanResponse{
		Score:           score,
		ThreatLevel:     level,
		Analysis:        analysis,
		MatchedPatterns: matches,
		Entropy:         entropy,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ThreatHandler) HandleProcessScan(w http.ResponseWriter, r *http.Request) {
	count, log := h.service.AnalyzeAndBlockProcesses()

	// If threats were blocked, trigger AI playbook generation via Java Policy Engine
	if count > 0 {
		playbookReq := map[string]interface{}{
			"process_id": "MULTIPLE",
			"score":      100, // Critical block
			"context":    log,
		}
		jsonData, _ := json.Marshal(playbookReq)
		// Internal call to Java Policy Engine
		http.Post("http://localhost:8082/api/v1/policies/generate-playbook", "application/json", bytes.NewBuffer(jsonData))
	}

	resp := map[string]interface{}{
		"blocked_count": count,
		"log":           log,
		"status":        "success",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
