package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/opensearch-project/opensearch-go/v2"
)

func GetEventsHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		orgID, ok := r.Context().Value(organizationIDKey).(int)
		if !ok {
			http.Error(w, "Organization ID not found", http.StatusInternalServerError)
			return
		}

		opensearchAddr := os.Getenv("OPENSEARCH_ADDR")
		if opensearchAddr == "" {
			opensearchAddr = "http://opensearch:9200"
		}

		osClient, err := opensearch.NewClient(opensearch.Config{
			Addresses: []string{opensearchAddr},
		})
		if err != nil {
			log.Printf("Failed to create OpenSearch client: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		query := fmt.Sprintf(`{
			"query": {
				"bool": {
					"must": [
						{ "match": { "organization_id": %d } }
					]
				}
			}
		}`, orgID)

		res, err := osClient.Search(
			osClient.Search.WithIndex("events"),
			osClient.Search.WithBody(strings.NewReader(query)),
			osClient.Search.WithSize(100),
			osClient.Search.WithSort("timestamp:desc"),
		)
		if err != nil {
			log.Printf("Failed to search OpenSearch: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer res.Body.Close()

		if res.IsError() {
			log.Printf("Error from OpenSearch: %s", res.String())
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		var result map[string]interface{}
		if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
			log.Printf("Failed to decode OpenSearch response: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(result)
	}
}
