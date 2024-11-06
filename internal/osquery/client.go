package osquery

import (
	"fmt"
	"time"

	"github.com/osquery/osquery-go"
)

// NewClient creates an osquery client connected to the specified address with retry logic.
func NewClient(address string, timeout time.Duration, maxRetries int, retryDelay time.Duration) (*osquery.ExtensionManagerClient, error) {
	var client *osquery.ExtensionManagerClient
	var err error

	for i := 0; i < maxRetries; i++ {
		client, err = osquery.NewClient(address, timeout)
		if err != nil {
			fmt.Printf("Failed to connect to osquery (attempt %d/%d): %v\n", i+1, maxRetries, err)
			time.Sleep(retryDelay)
			continue
		}

		if _, pingErr := client.Ping(); pingErr != nil {
			fmt.Printf("Ping failed after connecting to osquery (attempt %d/%d): %v\n", i+1, maxRetries, pingErr)
			err = pingErr
			client.Close()
			time.Sleep(retryDelay)
			continue
		}

		return client, nil
	}

	return nil, fmt.Errorf("failed to connect to osquery after %d attempts: %w", maxRetries, err)
}
