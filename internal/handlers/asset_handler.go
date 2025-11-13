package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/asset"
)

func CreateAssetHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		var a asset.Asset
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		a.OrganizationID = orgID
		query := `
			INSERT INTO assets (hostname, ip_address, os_version, mac_address, agent_version, status, last_heartbeat, criticality, organization_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id`
		err := db.QueryRow(query, a.Hostname, a.IPAddress, a.OSVersion, a.MACAddress, a.AgentVersion, a.Status, a.LastHeartbeat, a.Criticality, a.OrganizationID).Scan(&a.ID)
		if err != nil {
			http.Error(w, "Failed to create asset", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(a)
	}
}

func GetAssetsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		rows, err := db.Query("SELECT id, hostname, ip_address, os_version, mac_address, agent_version, status, last_heartbeat, criticality, organization_id FROM assets WHERE organization_id = $1", orgID)
		if err != nil {
			http.Error(w, "Failed to get assets", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var assets []asset.Asset
		for rows.Next() {
			var a asset.Asset
			if err := rows.Scan(&a.ID, &a.Hostname, &a.IPAddress, &a.OSVersion, &a.MACAddress, &a.AgentVersion, &a.Status, &a.LastHeartbeat, &a.Criticality, &a.OrganizationID); err != nil {
				http.Error(w, "Failed to scan asset", http.StatusInternalServerError)
				return
			}
			assets = append(assets, a)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(assets)
	}
}

func GetAssetHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid asset ID", http.StatusBadRequest)
			return
		}

		var a asset.Asset
		query := "SELECT id, hostname, ip_address, os_version, mac_address, agent_version, status, last_heartbeat, criticality, organization_id FROM assets WHERE id = $1 AND organization_id = $2"
		err = db.QueryRow(query, id, orgID).Scan(&a.ID, &a.Hostname, &a.IPAddress, &a.OSVersion, &a.MACAddress, &a.AgentVersion, &a.Status, &a.LastHeartbeat, &a.Criticality, &a.OrganizationID)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Asset not found", http.StatusNotFound)
				return
			}
			http.Error(w, "Failed to get asset", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(a)
	}
}

func UpdateAssetHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid asset ID", http.StatusBadRequest)
			return
		}

		var a asset.Asset
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		query := `
			UPDATE assets
			SET hostname = $1, ip_address = $2, os_version = $3, mac_address = $4, agent_version = $5, status = $6, last_heartbeat = $7, criticality = $8
			WHERE id = $9 AND organization_id = $10`
		_, err = db.Exec(query, a.Hostname, a.IPAddress, a.OSVersion, a.MACAddress, a.AgentVersion, a.Status, a.LastHeartbeat, a.Criticality, id, orgID)
		if err != nil {
			http.Error(w, "Failed to update asset", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func DeleteAssetHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			http.Error(w, "Invalid asset ID", http.StatusBadRequest)
			return
		}

		_, err = db.Exec("DELETE FROM assets WHERE id = $1 AND organization_id = $2", id, orgID)
		if err != nil {
			http.Error(w, "Failed to delete asset", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

func HeartbeatHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		var a asset.Asset
		if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		a.OrganizationID = orgID
		a.LastHeartbeat = sql.NullTime{Time: time.Now(), Valid: true}
		a.Status = sql.NullString{String: "online", Valid: true}

		query := `
			INSERT INTO assets (hostname, ip_address, os_version, mac_address, agent_version, status, last_heartbeat, criticality, organization_id)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
			ON CONFLICT (hostname) DO UPDATE
			SET ip_address = $2, os_version = $3, mac_address = $4, agent_version = $5, status = $6, last_heartbeat = $7, criticality = $8, organization_id = $9`
		_, err := db.Exec(query, a.Hostname, a.IPAddress, a.OSVersion, a.MACAddress, a.AgentVersion, a.Status, a.LastHeartbeat, a.Criticality, a.OrganizationID)
		if err != nil {
			http.Error(w, "Failed to process heartbeat", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
