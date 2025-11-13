
package metrics

import (
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// MetricStore defines the interface for storing and retrieving system metrics
type MetricStore interface {
	StoreSystemMetric(metric models.SystemMetric, organizationID int) error
	GetSystemMetrics(metricType string, from, to time.Time, organizationID int) ([]models.SystemMetric, error)
}
