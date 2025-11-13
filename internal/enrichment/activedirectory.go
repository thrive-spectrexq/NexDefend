
package enrichment

import "github.com/thrive-spectrexq/NexDefend/internal/models"

// ActiveDirectoryConnector defines the interface for an Active Directory connector.
type ActiveDirectoryConnector interface {
	GetUser(username string) (*models.User, error)
}

// MockActiveDirectoryConnector is a mock implementation of the ActiveDirectoryConnector interface.
type MockActiveDirectoryConnector struct{}

// GetUser fetches a user from Active Directory.
func (c *MockActiveDirectoryConnector) GetUser(username string) (*models.User, error) {
	// In a real implementation, you would fetch the user from Active Directory.
	return &models.User{
		Username: username,
		Email:    "test@test.com",
	}, nil
}
