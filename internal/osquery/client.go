package osquery

import (
	"github.com/osquery/osquery-go"
	"time"
)

// NewClient creates an osquery client connected to the specified address
func NewClient(address string, timeout time.Duration) (*osquery.ExtensionManagerClient, error) {
	return osquery.NewClient(address, timeout)
}
