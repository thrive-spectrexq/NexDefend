
package models

import "time"

// CommonEvent represents a normalized event.
type CommonEvent struct {
	Timestamp   time.Time   `json:"timestamp"`
	EventType   string      `json:"event_type"`
	Hostname    string      `json:"hostname"`
	IPAddress   string      `json:"ip_address"`
	OSVersion   string      `json:"os_version"`
	AgentVersion string      `json:"agent_version"`
	RawEvent    interface{} `json:"raw_event"`
}
