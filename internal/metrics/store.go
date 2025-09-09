package metrics

import "time"

// MetricStore defines the interface for storing and retrieving system metrics
type MetricStore interface {
	StoreSystemMetric(metric SystemMetric) error
	GetSystemMetrics(metricType string, from, to time.Time) ([]SystemMetric, error)
}
