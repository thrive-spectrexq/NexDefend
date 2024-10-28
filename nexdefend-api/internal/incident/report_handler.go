package incident

import (
	"encoding/json"
	"net/http"
)

// ReportHandler handles incident reports
func ReportHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{"status": "Incident report filed successfully"}
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
	}
}
