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
	// 1. Get IOC from query parameter
	ioc := r.URL.Query().Get("ioc")
	if ioc == "" {
		http.Error(w, "Missing IOC parameter", http.StatusBadRequest)
		return
	}

	// 2. Call the correct interface method: CheckIOC
	isMalicious, err := h.tipProvider.CheckIOC(ioc)
	if err != nil {
		// Log the error internally in a real app
		http.Error(w, "Failed to check IOC: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Construct a standard JSON response
	response := map[string]interface{}{
		"ioc":          ioc,
		"is_malicious": isMalicious,
		"reputation":   "unknown",
	}

	if isMalicious {
		response["reputation"] = "malicious"
	} else {
		response["reputation"] = "clean"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
