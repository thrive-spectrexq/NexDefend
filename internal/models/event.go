
package models

import "time"

// Event is a generic wrapper for different types of security events.
type Event struct {
	EventType string      `json:"event_type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}
