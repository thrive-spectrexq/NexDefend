package osquery

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/osquery/osquery-go"
)

var osqueryAddress = "/var/osquery/shell.em"

// IOCScanHandler scans for IOCs using osquery
func IOCScanHandler(w http.ResponseWriter, r *http.Request) {
	client, err := osquery.NewClient(osqueryAddress, 5*time.Second)
	if err != nil {
		log.Println("Error creating osquery client:", err)
		jsonErrorResponse(w, "Failed to connect to osquery", http.StatusInternalServerError)
		return
	}
	defer client.Close()

	// Retrieve IOC type from query parameters
	iocType := r.URL.Query().Get("type")
	var query string

	// Define queries for different IOC types
	switch iocType {
	case "malicious_process":
		query = "SELECT name, path, pid FROM processes WHERE on_disk = 0;"
	case "specific_process_name":
		query = "SELECT * FROM processes WHERE name LIKE '%malicious_process_name%';"
	case "network_connection":
		query = `SELECT DISTINCT process.name, listening_ports.port, processes.pid
                  FROM listening_ports JOIN processes USING (pid)
                  WHERE listening_ports.address = '0.0.0.0' AND remote_port NOT IN (80, 443);`
	case "kernel_module_name":
		query = "SELECT * FROM kernel_modules WHERE name LIKE '%malicious_module_name%';"
	case "recent_kernel_module":
		query = "SELECT * FROM kernel_modules WHERE loaded_at > (CURRENT_TIMESTAMP - INTERVAL 1 HOUR);"
	case "yara_specific_file":
		query = `SELECT * FROM yara WHERE path="/bin/ls" AND sig_group="sig_group_1";`
	case "yara_directory":
		query = `SELECT * FROM yara WHERE path LIKE '/usr/bin/%' AND sig_group="sig_group_2";`
	case "new_files":
		query = `SELECT * FROM file_events WHERE path="/Users/%/tmp/" AND event_type="CREATE";`
	case "modified_files":
		query = `SELECT * FROM file_events WHERE path="/etc/passwd" AND event_type="MODIFY";`
	case "powershell_command":
		query = `SELECT * FROM powershell_events WHERE command LIKE '%malicious_command%';`
	case "powershell_script":
		query = `SELECT * FROM powershell_events WHERE script_block LIKE '%malicious_script%';`
	default:
		// Default query if no specific type is provided
		query = "SELECT * FROM processes WHERE on_disk = 0;"
	}

	// Execute the query
	resp, err := client.Query(query)
	if err != nil {
		log.Println("Error executing osquery query:", err)
		jsonErrorResponse(w, "Query failed", http.StatusInternalServerError)
		return
	}

	// Return response in JSON format
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"iocType": iocType,
		"results": resp.Response,
	})
}

func jsonErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "error",
		"message": message,
	})
}
