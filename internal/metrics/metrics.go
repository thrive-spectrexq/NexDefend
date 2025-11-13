
package metrics

import (
	"log"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// SystemMetrics holds the collected system metrics
type SystemMetrics struct {
	CPULoad       float64
	MemoryUsage   float64
	DiskUsage     float64
}

// CollectMetrics collects system metrics and sends them to a channel
func CollectMetrics(store MetricStore) {
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

		// TODO: Pass a real organization ID to the StoreSystemMetric function.
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
