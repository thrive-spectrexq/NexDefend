
package enrichment

import "github.com/thrive-spectrexq/NexDefend/internal/models"

// ServiceNowConnector defines the interface for a ServiceNow connector.
type ServiceNowConnector interface {
	GetAsset(hostname string) (*models.Asset, error)
}

// MockServiceNowConnector is a mock implementation of the ServiceNowConnector interface.
type MockServiceNowConnector struct{}

// GetAsset fetches an asset from ServiceNow.
func (c *MockServiceNowConnector) GetAsset(hostname string) (*models.Asset, error) {
	// In a real implementation, you would fetch the asset from ServiceNow.
	return &models.Asset{
		Hostname: hostname,
		IPAddress: "1.2.3.4",
		OSVersion: "Linux",
	}, nil
}
