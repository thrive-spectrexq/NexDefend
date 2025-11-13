package metrics

import "time"

// MetricStore defines the interface for storing and retrieving system metrics
type MetricStore interface {
	StoreSystemMetric(metric SystemMetric, organizationID int) error
	GetSystemMetrics(metricType string, from, to time.Time, organizationID int) ([]SystemMetric, error)
}
