package agent

import (
	"log"
	"time"

	"github.com/shirou/gopsutil/v3/process"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
)

// StartAgent runs the agent logic in a background routine
func StartAgent() {
	go monitorProcesses()
}

func monitorProcesses() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		processes, err := process.Processes()
		if err != nil {
			log.Println("Error getting processes:", err)
			continue
		}

		// Simple logic: Count processes as a metric
		processCount := float64(len(processes))
		db.DB.Create(&db.Metric{
			Type:  "process_count",
			Value: processCount,
		})

		// In a real implementation, we would do more complex analysis here
		// matching the logic in nexdefend-agent/main.go
	}
}
