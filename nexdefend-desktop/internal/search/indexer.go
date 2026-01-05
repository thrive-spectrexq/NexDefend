package search

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/blevesearch/bleve/v2"
	"nexdefend-desktop/internal/bus"
)

// LogEntry represents a searchable document
type LogEntry struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	Level     string    `json:"level"`
	Message   string    `json:"message"`
	Source    string    `json:"source"`
	Type      string    `json:"type"` // "flow", "alert", "sys"
}

type LocalIndexer struct {
	Index bleve.Index
}

// NewIndexer initializes the Bleve index on disk
func NewIndexer(appDataPath string) (*LocalIndexer, error) {
	// Create a specific folder for our index
	storagePath := filepath.Join(appDataPath, "nexdefend-data")
	if err := os.MkdirAll(storagePath, 0755); err != nil {
		return nil, err
	}

	indexPath := filepath.Join(storagePath, "events.bleve")
	var index bleve.Index
	var err error

	// Open existing or create new index
	if _, err := os.Stat(indexPath); os.IsNotExist(err) {
		mapping := bleve.NewIndexMapping()
		index, err = bleve.New(indexPath, mapping)
	} else {
		index, err = bleve.Open(indexPath)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to init bleve index: %v", err)
	}

	li := &LocalIndexer{Index: index}

	// Start background consumer
	go li.consumeEvents()

	return li, nil
}

// consumeEvents listens to the EventBus and indexes everything
func (i *LocalIndexer) consumeEvents() {
	// We subscribe to multiple topics to index them all
	alertCh := bus.GetBus().Subscribe(bus.EventSecurityAlert)
	flowCh := bus.GetBus().Subscribe(bus.EventNetFlow)

	for {
		select {
		case msg := <-alertCh:
			i.indexDocument("alert", msg)
		case msg := <-flowCh:
			i.indexDocument("flow", msg)
		}
	}
}

func (i *LocalIndexer) indexDocument(docType string, data interface{}) {
	// In a real app, generate a proper ID (UUID)
	id := fmt.Sprintf("%d", time.Now().UnixNano())

	// Wrap data for indexing
	doc := struct {
		Type      string      `json:"type"`
		Timestamp time.Time   `json:"timestamp"`
		Data      interface{} `json:"data"`
	}{
		Type:      docType,
		Timestamp: time.Now(),
		Data:      data,
	}

	i.Index.Index(id, doc)
}

// Search performs a query against the local index
func (i *LocalIndexer) Search(queryStr string) (*bleve.SearchResult, error) {
	// Search for "everything" if query is empty
	if queryStr == "" {
		queryStr = "*"
	}

	query := bleve.NewQueryStringQuery(queryStr)
	searchRequest := bleve.NewSearchRequest(query)
	searchRequest.Size = 50
	searchRequest.SortBy([]string{"-timestamp"}) // Sort by newest

	return i.Index.Search(searchRequest)
}
