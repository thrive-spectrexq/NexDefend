package search

import (
	"log"
	"os"

	"github.com/opensearch-project/opensearch-go/v2"
)

// NewClient creates a new OpenSearch client
func NewClient() (*opensearch.Client, error) {
	opensearchAddr := os.Getenv("OPENSEARCH_ADDR")
	if opensearchAddr == "" {
		opensearchAddr = "http://opensearch:9200"
	}

	client, err := opensearch.NewClient(opensearch.Config{
		Addresses: []string{opensearchAddr},
	})
	if err != nil {
		log.Printf("Failed to create OpenSearch client: %v", err)
		return nil, err
	}
	return client, nil
}
