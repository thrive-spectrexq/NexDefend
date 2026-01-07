
package ndr

import (
	"encoding/json"
	"log"
	"time"

	"github.com/hpcloud/tail"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// SuricataCollector defines the interface for a Suricata log collector.
type SuricataCollector interface {
	StartCollector() error
}

// FileTailSuricataCollector implements SuricataCollector by tailing eve.json
type FileTailSuricataCollector struct {
	LogPath   string
	EventChan chan<- models.CommonEvent
}

func NewSuricataCollector(path string, eventChan chan<- models.CommonEvent) *FileTailSuricataCollector {
	return &FileTailSuricataCollector{LogPath: path, EventChan: eventChan}
}

// StartCollector starts tailing the Suricata log file.
func (c *FileTailSuricataCollector) StartCollector() error {
	log.Printf("Starting Suricata log collector on file: %s", c.LogPath)

	config := tail.Config{
		Follow: true,
		ReOpen: true,
		MustExist: false,
		Poll: true,
	}

	t, err := tail.TailFile(c.LogPath, config)
	if err != nil {
		return err
	}

	go func() {
		for line := range t.Lines {
			if line.Err != nil {
				log.Printf("Error reading Suricata log: %v", line.Err)
				continue
			}

			var event map[string]interface{}
			if err := json.Unmarshal([]byte(line.Text), &event); err == nil {
				// Only interested in alerts
				if eventType, ok := event["event_type"].(string); ok && eventType == "alert" {

					// Normalize to CommonEvent
					commonEvent := models.CommonEvent{
						Timestamp: time.Now(),
						EventType: "suricata_alert",
						RawEvent:  event,
					}

					// Send to Ingestor
					select {
					case c.EventChan <- commonEvent:
					default:
						log.Println("Warning: Internal event channel full, dropping Suricata alert")
					}
				}
			}
		}
	}()

	return nil
}
