package osquery

import (
	"fmt"
	"time"

	"github.com/osquery/osquery-go"
)

// NewClient creates an osquery client connected to the specified address with retry logic.
func NewClient(address string, timeout time.Duration) (*osquery.ExtensionManagerClient, error) {
	var client *osquery.ExtensionManagerClient
	var err error

	for i := 0; i < 3; i++ { // Try up to 3 times
		// Attempt to create the client connection
		client, err = osquery.NewClient(address, timeout)
		if err != nil {
			fmt.Printf("Failed to connect to osquery (attempt %d/3): %v\n", i+1, err)
			time.Sleep(2 * time.Second) // Wait a moment before retrying
			continue
		}

		// Perform a ping to confirm the connection is stable
		if _, pingErr := client.Ping(); pingErr != nil {
			fmt.Printf("Ping failed after connecting to osquery (attempt %d/3): %v\n", i+1, pingErr)
			err = pingErr  // Update error if ping fails
			client.Close() // Close this attempt's client before retrying
			time.Sleep(2 * time.Second)
			continue
		}

		// Successfully connected and pinged
		return client, nil
	}

	// After all retries, return the final error
	return nil, fmt.Errorf("failed to connect to osquery after multiple attempts: %w", err)
}
