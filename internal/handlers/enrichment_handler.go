
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/enrichment"
)

func GetUserHandler(adConnector enrichment.ActiveDirectoryConnector) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		username := vars["username"]

		user, err := adConnector.GetUser(username)
		if err != nil {
			http.Error(w, "Failed to get user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(user)
	}
}

func GetEnrichedAssetHandler(snowConnector enrichment.ServiceNowConnector) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		hostname := vars["hostname"]

		asset, err := snowConnector.GetAsset(hostname)
		if err != nil {
			http.Error(w, "Failed to get asset", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(asset)
	}
}
