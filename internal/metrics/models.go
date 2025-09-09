package metrics

import "time"

// SystemMetric represents a single system metric reading
type SystemMetric struct {
	ID         int       `json:"id"`
	MetricType string    `json:"metric_type"`
	Value      float64   `json:"value"`
	Timestamp  time.Time `json:"timestamp"`
}
