
package agent

import "github.com/thrive-spectrexq/NexDefend/internal/models"

// EnrollAgent enrolls a new agent in the system.
func EnrollAgent(enrollmentRequest models.AgentEnrollmentRequest) (*models.Agent, error) {
	// In a real implementation, you would enroll the agent in the database.
	return &models.Agent{
		ID:       1,
		Hostname: enrollmentRequest.Hostname,
		IPAddress: enrollmentRequest.IPAddress,
		OSVersion: enrollmentRequest.OSVersion,
		Status:   "enrolled",
	}, nil
}
