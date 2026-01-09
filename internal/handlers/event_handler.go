
package handlers

import (
	"bytes"
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/thrive-spectrexq/NexDefend/internal/search"
)

type EventHandler struct {
	osClient *search.Client
}

func NewEventHandler(osClient *search.Client) *EventHandler {
	return &EventHandler{osClient: osClient}
}

// GetEvents provides advanced search capabilities
func (h *EventHandler) GetEvents(w http.ResponseWriter, r *http.Request) {
	if h.osClient == nil || h.osClient.Client == nil {
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

	if startTime != "" && endTime != "" {
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
	res, err := h.osClient.Search(
		h.osClient.Search.WithContext(context.Background()),
		h.osClient.Search.WithIndex("nexdefend-events"),
		h.osClient.Search.WithBody(strings.NewReader(queryBody)),
	)

	if err != nil {
		http.Error(w, "Search backend unavailable", http.StatusServiceUnavailable)
		return
	}
	defer res.Body.Close()

	// 4. Return Raw JSON
	w.Header().Set("Content-Type", "application/json")
	buf := new(bytes.Buffer)
	_, _ = buf.ReadFrom(res.Body)
	w.Write(buf.Bytes())
}

// IngestEvent handles direct HTTP ingestion of events
func (h *EventHandler) IngestEvent(w http.ResponseWriter, r *http.Request) {
	// Simple stub for now, just accepts JSON and could forward to Kafka or OS
	w.WriteHeader(http.StatusAccepted)
}

func escapeQuery(q string) string {
	return strings.Replace(q, `"`, `\"`, -1)
}
