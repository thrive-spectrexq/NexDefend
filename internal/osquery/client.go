package osquery

import (
	"fmt"
	"time"

	"github.com/osquery/osquery-go"
)

// NewClient creates an osquery client connected to the specified address
func NewClient(address string, timeout time.Duration) (*osquery.ExtensionManagerClient, error) {
	// Attempt to connect to osquery with retries
	var client *osquery.ExtensionManagerClient
	var err error

	for i := 0; i < 3; i++ { // Try up to 3 times
		client, err = osquery.NewClient(address, timeout)
		if err == nil {
			// Optionally: Perform a simple query to confirm the connection
			_, pingErr := client.Ping()
			if pingErr == nil {
				return client, nil
			} else {
				err = pingErr // update error if ping fails
			}
		}

		fmt.Printf("Failed to connect to osquery (attempt %d/3): %v\n", i+1, err)
		time.Sleep(2 * time.Second) // Wait a moment before retrying
	}

	return nil, fmt.Errorf("failed to connect to osquery after multiple attempts: %w", err)
}
