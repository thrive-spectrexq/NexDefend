package agent

import (
	"log"
	"time"
	"math/rand"
	"fmt"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
)

// StartAgent runs the agent logic in a background routine
func StartAgent() {
	go monitorSystem()
}

func monitorSystem() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		// 1. Process Count
		processes, err := process.Processes()
		if err != nil {
			log.Println("Error getting processes:", err)
		} else {
			processCount := float64(len(processes))
			db.DB.Create(&db.Metric{
				Type:  "process_count",
				Value: processCount,
			})
		}

		// 2. CPU Usage
		cpuPercent, err := cpu.Percent(0, false)
		if err == nil && len(cpuPercent) > 0 {
			db.DB.Create(&db.Metric{
				Type:  "cpu_usage",
				Value: cpuPercent[0],
			})

			// Simple Anomaly Detection: High CPU = Incident
			if cpuPercent[0] > 80.0 {
				createIncident("High CPU Usage Detected", "Critical", fmt.Sprintf("CPU usage spiked to %.2f%%", cpuPercent[0]))
			}
		}

		// 3. Memory Usage
		v, err := mem.VirtualMemory()
		if err == nil {
			db.DB.Create(&db.Metric{
				Type:  "memory_usage",
				Value: float64(v.UsedPercent),
			})
		}

		// 4. Simulated Network Threat (Randomly generate for demo)
		if rand.Float32() < 0.05 { // 5% chance per tick
			createIncident("Suspicious Network Connection", "Medium", "Outbound connection to known malicious IP 192.168.1.105")
		}
	}
}

func createIncident(title, severity, description string) {
	// Check if a similar open incident exists to avoid flooding
	var count int64
	db.DB.Model(&db.Incident{}).Where("title = ? AND status = ?", title, "Open").Count(&count)

	if count == 0 {
		db.DB.Create(&db.Incident{
			Title:       title,
			Severity:    severity,
			Description: description,
			Status:      "Open",
		})
		log.Printf("Generated Incident: %s", title)
	}
}
