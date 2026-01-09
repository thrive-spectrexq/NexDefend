package search

import (
	"log"
	"os"

	"github.com/opensearch-project/opensearch-go/v2"
)

// Client wraps the opensearch.Client to provide helper methods if needed,
// but for now type alias or just use opensearch.Client in handlers.
// The handlers expect *search.Client, but in routes.go we are passing *opensearch.Client returned by NewClient.
// So we should alias it or wrap it.
// Given the errors "undefined: search.Client", it seems the struct is missing.

type Client struct {
	*opensearch.Client
}

// NewClient creates a new OpenSearch client
func NewClient() (*Client, error) {
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
	return &Client{client}, nil
}
