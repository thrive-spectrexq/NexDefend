package handlers

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/opensearch-project/opensearch-go/v2"
)

// GetEventsHandler provides advanced search capabilities
func GetEventsHandler(osClient *opensearch.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if osClient == nil {
			http.Error(w, "Search backend not configured", http.StatusServiceUnavailable)
			return
		}

		// 1. Extract Query Parameters
		q := r.URL.Query().Get("q")         // Search term (e.g., "error", "ssh")
		startTime := r.URL.Query().Get("start") // ISO8601
		endTime := r.URL.Query().Get("end")
		limit := r.URL.Query().Get("limit")

		if limit == "" { limit = "100" }
		if q == "" { q = "*" } // Match all if empty

		// 2. Build OpenSearch DSL Query
		// This uses a bool query to combine time range and keyword search
		// Simplified DSL construction
		queryBody := fmt.Sprintf(`{
			"size": %s,
			"sort": [ { "@timestamp": "desc" } ],
			"query": {
				"bool": {
					"must": [
						{ "query_string": { "query": "%s" } }
					]
				}
			}
		}`, limit, escapeQuery(q))

		// Add time range if provided
		if startTime != "" && endTime != "" {
			// This is a naive injection of range query into the must array of the JSON string constructed above.
			// For robustness, a struct-based marshalling or proper JSON builder should be used.
			// However, adhering to the provided example logic:
			// We'll reconstruct to include range properly.
			queryBody = fmt.Sprintf(`{
				"size": %s,
				"sort": [ { "@timestamp": "desc" } ],
				"query": {
					"bool": {
						"must": [
							{ "query_string": { "query": "%s" } },
							{ "range": { "@timestamp": { "gte": "%s", "lte": "%s" } } }
						]
					}
				}
			}`, limit, escapeQuery(q), startTime, endTime)
		}

		// 3. Execute Search
		res, err := osClient.Search(
			osClient.Search.WithContext(context.Background()),
			osClient.Search.WithIndex("nexdefend-events"),
			osClient.Search.WithBody(strings.NewReader(queryBody)),
		)

		if err != nil {
			http.Error(w, "Search backend unavailable", http.StatusServiceUnavailable)
			return
		}
		defer res.Body.Close()

		// 4. Return Raw JSON from OpenSearch (Frontend parses hits)
		w.Header().Set("Content-Type", "application/json")
		// We stream the body directly to avoid overhead of unmarshal/marshal
		// in a high-throughput scenario
		buf := new(bytes.Buffer)
		_, _ = buf.ReadFrom(res.Body)
		w.Write(buf.Bytes())
	}
}

func escapeQuery(q string) string {
	// Basic sanitation to prevent JSON breaking
	return strings.Replace(q, `"`, `\"`, -1)
}
