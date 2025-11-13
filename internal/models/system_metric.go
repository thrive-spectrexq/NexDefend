
package models

import "time"

// SystemMetric represents a system metric in the database.
type SystemMetric struct {
	ID         int       `json:"id"`
	MetricType string    `json:"metric_type"`
	Value      float64   `json:"value"`
	Timestamp  time.Time `json:"timestamp"`
}
