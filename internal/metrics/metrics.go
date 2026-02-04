
package metrics

import (
	"log"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/thrive-spectrexq/NexDefend/internal/autoscaling"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// Prometheus Metrics
var (
	cpuLoadMetric = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "system_cpu_load_percent",
		Help: "Current CPU load in percent",
	})
	memoryUsageMetric = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "system_memory_usage_percent",
		Help: "Current memory usage in percent",
	})
	diskUsageMetric = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "system_disk_usage_percent",
		Help: "Current disk usage in percent",
	})
)

// SystemMetrics holds the collected system metrics
type SystemMetrics struct {
	CPULoad       float64
	MemoryUsage   float64
	DiskUsage     float64
}

// CollectMetrics collects system metrics and sends them to a channel
func CollectMetrics(store MetricStore, autoScaler *autoscaling.AutoScaler) {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		cpuLoad, err := cpu.Percent(time.Second, false)
		if err != nil {
			log.Printf("Error collecting CPU metrics: %v", err)
			continue
		}

		memInfo, err := mem.VirtualMemory()
		if err != nil {
			log.Printf("Error collecting memory metrics: %v", err)
			continue
		}

		diskInfo, err := disk.Usage("/")
		if err != nil {
			log.Printf("Error collecting disk metrics: %v", err)
			continue
		}

		// Auto-Scaling Trigger Check
		if autoScaler != nil && len(cpuLoad) > 0 {
			autoScaler.Check(cpuLoad[0], memInfo.UsedPercent)
		}

		// Update Prometheus Metrics
		if len(cpuLoad) > 0 {
			cpuLoadMetric.Set(cpuLoad[0])
		}
		memoryUsageMetric.Set(memInfo.UsedPercent)
		diskUsageMetric.Set(diskInfo.UsedPercent)

		// System metrics are associated with the default organization ID 1.
		// In a multi-tenant environment, this should be configurable or context-aware.
		organizationID := 1

		metrics := models.SystemMetric{
			MetricType: "cpu_load",
			Value:      cpuLoad[0],
			Timestamp:  time.Now(),
		}
		if err := store.StoreSystemMetric(metrics, organizationID); err != nil {
			log.Printf("Error storing CPU metric: %v", err)
		}

		metrics = models.SystemMetric{
			MetricType: "memory_usage",
			Value:      memInfo.UsedPercent,
			Timestamp:  time.Now(),
		}
		if err := store.StoreSystemMetric(metrics, organizationID); err != nil {
			log.Printf("Error storing memory metric: %v", err)
		}

		metrics = models.SystemMetric{
			MetricType: "disk_usage",
			Value:      diskInfo.UsedPercent,
			Timestamp:  time.Now(),
		}
		if err := store.StoreSystemMetric(metrics, organizationID); err != nil {
			log.Printf("Error storing disk metric: %v", err)
		}
	}
}
