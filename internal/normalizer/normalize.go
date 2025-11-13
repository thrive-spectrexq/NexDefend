
package normalizer

import (
	"encoding/json"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// NormalizeEvent transforms a raw agent log into a common event format.
func NormalizeEvent(rawEvent []byte) (*models.CommonEvent, error) {
	var event models.Event
	if err := json.Unmarshal(rawEvent, &event); err != nil {
		return nil, err
	}

	commonEvent := &models.CommonEvent{
		Timestamp:   event.Timestamp,
		EventType:   event.EventType,
		RawEvent:    event.Data,
	}

	return commonEvent, nil
}
