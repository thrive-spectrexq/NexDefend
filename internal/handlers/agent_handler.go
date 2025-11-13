package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

func GetAgentConfigHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		hostname := vars["hostname"]

		var config json.RawMessage
		query := `
			SELECT ac.config_jsonb
			FROM agent_configs ac
			JOIN assets a ON ac.asset_id = a.id
			WHERE a.hostname = $1 AND a.organization_id = $2`
		err := db.QueryRow(query, hostname, orgID).Scan(&config)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Agent config not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to get agent config", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(config)
	}
}
