
package ndr

import "log"

// NetFlowCollector defines the interface for a NetFlow collector.
type NetFlowCollector interface {
	StartCollector() error
}

// MockNetFlowCollector is a mock implementation of the NetFlowCollector interface.
type MockNetFlowCollector struct{}

// StartCollector starts the NetFlow collector.
func (c *MockNetFlowCollector) StartCollector() error {
	log.Println("Starting NetFlow collector...")
	// In a real implementation, you would start a NetFlow collector.
	return nil
}
