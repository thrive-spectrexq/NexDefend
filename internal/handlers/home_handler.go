package handlers

import (
	"encoding/json"
	"net/http"
)

// HomeHandler handles the home route
func HomeHandler(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"status": "success", "message": "Welcome to NexDefend API!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
