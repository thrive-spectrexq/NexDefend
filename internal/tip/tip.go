
package tip

// TIP defines the interface for the Threat Intelligence Platform.
type TIP interface {
	CheckIOC(ioc string) (bool, error)
}

// MockTIP is a mock implementation of the TIP interface.
type MockTIP struct{}

// CheckIOC checks if an IOC is in the TIP.
func (t *MockTIP) CheckIOC(ioc string) (bool, error) {
	// In a real implementation, you would check the IOC against the TIP database.
	return false, nil
}
