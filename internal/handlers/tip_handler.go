package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/tip"
)

type TIPHandler struct {
	tipProvider tip.TIP
}

// NewTIPHandler initializes a new TIPHandler
func NewTIPHandler(provider tip.TIP) *TIPHandler {
	return &TIPHandler{tipProvider: provider}
}

// CheckIOC checks if an Indicator of Compromise (IOC) is malicious
func (h *TIPHandler) CheckIOC(w http.ResponseWriter, r *http.Request) {
	ioc := r.URL.Query().Get("ioc")
	if ioc == "" {
		http.Error(w, "Missing IOC parameter", http.StatusBadRequest)
		return
	}

	// Default to 'ip' type if not specified, or infer it
	// For simplicity in this demo, assuming IP or Domain
	rep, err := h.tipProvider.GetReputation(ioc, "ip")
	if err != nil {
		// Fallback or try domain if IP fails, or just return error
		http.Error(w, "Failed to check IOC: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rep)
}
