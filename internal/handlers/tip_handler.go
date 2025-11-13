
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/tip"
)

func CheckIOCHandler(tip tip.TIP) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var ioc string
		if err := json.NewDecoder(r.Body).Decode(&ioc); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		isIOC, err := tip.CheckIOC(ioc)
		if err != nil {
			http.Error(w, "Failed to check IOC", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]bool{"is_ioc": isIOC})
	}
}
