
package case_management

import (
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

func CreateCase(createCaseRequest models.CreateCaseRequest) (models.Case, error) {
	newCase := models.Case{
		Title:       createCaseRequest.Title,
		Description: createCaseRequest.Description,
		Priority:    createCaseRequest.Priority,
		Status:      "Open",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	return newCase, nil
}
