package autoscaling

import (
	"fmt"
	"log"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// AutoScaler monitors system load and triggers mock scaling events
type AutoScaler struct {
	eventsChan chan<- models.CommonEvent
	lastScale  time.Time
}

// NewAutoScaler creates a new AutoScaler
func NewAutoScaler(eventsChan chan<- models.CommonEvent) *AutoScaler {
	return &AutoScaler{
		eventsChan: eventsChan,
		lastScale:  time.Now(),
	}
}

// Check evaluates metrics and triggers scaling if thresholds are exceeded
func (a *AutoScaler) Check(cpuLoad, memUsage float64) {
	// Cooldown to prevent spamming scaling events (e.g., once per minute)
	if time.Since(a.lastScale) < 1*time.Minute {
		return
	}

	threshold := 80.0

	if cpuLoad > threshold || memUsage > threshold {
		a.TriggerScaleUp(cpuLoad, memUsage)
	}
}

// TriggerScaleUp simulates a scaling action
func (a *AutoScaler) TriggerScaleUp(cpu, mem float64) {
	log.Printf("[AutoScaler] High load detected (CPU: %.2f%%, Mem: %.2f%%). Initiating scale-up...", cpu, mem)
	
	// Create a mock event for the system
	evt := models.CommonEvent{
		Timestamp: time.Now(),
		EventType: "system_notification",
		Hostname:  "nexus-cluster-control",
		IPAddress: "127.0.0.1",
		Data: map[string]interface{}{
			"message":  fmt.Sprintf("Auto-Scaling Triggered: CPU %.1f%%, Memory %.1f%%. Provisioning new nodes.", cpu, mem),
			"severity": "info",
			"source":   "AutoScaler",
		},
	}
	
	// Send to event bus (which goes to WebSocket)
	select {
	case a.eventsChan <- evt:
		a.lastScale = time.Now()
	default:
		log.Println("[AutoScaler] Event channel full, dropping scale event")
	}
}
