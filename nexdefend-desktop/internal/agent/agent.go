package agent

import (
	"fmt"
	"log"
	"math/rand"
	"sort"
	"sync"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-desktop/internal/db"
	"gorm.io/gorm"
)

// Data Structures for Live Monitoring
type ProcessInfo struct {
	PID  int32   `json:"pid"`
	Name string  `json:"name"`
	CPU  float64 `json:"cpu"`
	User string  `json:"user"`
}

type ConnectionInfo struct {
	FD        uint32 `json:"fd"`
	Family    uint32 `json:"family"`
	Type      uint32 `json:"type"`
	LocalIP   string `json:"local_ip"`
	LocalPort uint32 `json:"local_port"`
	RemoteIP  string `json:"remote_ip"`
	RemotePort uint32 `json:"remote_port"`
	Status    string `json:"status"`
}

// Global thread-safe store for live data
var (
	liveDataMutex   sync.RWMutex
	TopProcesses    []ProcessInfo
	ActiveConnections []ConnectionInfo
)

// StartAgent runs the agent logic in a background routine
func StartAgent() {
	go monitorSystem()
}

func monitorSystem() {
	// Initialize previous network counters for rate calculation
	prevNetStats, _ := net.IOCounters(false)

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		// Collect Real-time Data first (heavy ops)
		collectLiveProcesses()
		collectLiveConnections()

		// Wrap metric collection in a transaction to minimize disk I/O
		err := db.DB.Transaction(func(tx *gorm.DB) error {
			// 1. Process Count
			processes, err := process.Processes()
			if err != nil {
				log.Println("Error getting processes:", err)
			} else {
				processCount := float64(len(processes))
				if err := tx.Create(&db.Metric{
					Type:  "process_count",
					Value: processCount,
				}).Error; err != nil {
					return err
				}
			}

			// 2. CPU Usage
			cpuPercent, err := cpu.Percent(0, false)
			if err == nil && len(cpuPercent) > 0 {
				if err := tx.Create(&db.Metric{
					Type:  "cpu_usage",
					Value: cpuPercent[0],
				}).Error; err != nil {
					return err
				}

				// Simple Anomaly Detection: High CPU = Incident
				if cpuPercent[0] > 80.0 {
					go createIncident("High CPU Usage Detected", "Critical", fmt.Sprintf("CPU usage spiked to %.2f%%", cpuPercent[0]))
				}
			}

			// 3. Memory Usage
			v, err := mem.VirtualMemory()
			if err == nil {
				if err := tx.Create(&db.Metric{
					Type:  "memory_usage",
					Value: float64(v.UsedPercent),
				}).Error; err != nil {
					return err
				}
			}

			// 4. Network I/O (Rate calculation)
			currNetStats, err := net.IOCounters(false)
			if err == nil && len(currNetStats) > 0 && len(prevNetStats) > 0 {
				// Calculate bytes per second (approx over 5s interval)
				// Note: Storing raw bytes/sec or just raw counter? Let's store raw counter delta or rate.
				// Storing rate (KB/s) is more useful for dashboard.

				sentDelta := currNetStats[0].BytesSent - prevNetStats[0].BytesSent
				recvDelta := currNetStats[0].BytesRecv - prevNetStats[0].BytesRecv

				// Bytes per second
				sentRate := float64(sentDelta) / 5.0
				recvRate := float64(recvDelta) / 5.0

				if err := tx.Create(&db.Metric{Type: "network_sent_bps", Value: sentRate}).Error; err != nil { return err }
				if err := tx.Create(&db.Metric{Type: "network_recv_bps", Value: recvRate}).Error; err != nil { return err }

				prevNetStats = currNetStats
			}

			return nil
		})

		if err != nil {
			log.Println("Failed to commit metrics transaction:", err)
		}
	}
}

func collectLiveProcesses() {
	procs, err := process.Processes()
	if err != nil {
		return
	}

	var procList []ProcessInfo
	for _, p := range procs {
		// CPU percent is expensive, maybe limit to top?
		// Optimized: Just get basic info first? No, we need CPU to sort.
		// Windows: p.CPUPercent() can be slow if called on all.
		// For "Lite" desktop, let's just grab a few or accept the cost (it's every 5s).

		cpu, _ := p.CPUPercent()
		if cpu > 0.1 { // Filter idle
			name, _ := p.Name()
			username, _ := p.Username()
			procList = append(procList, ProcessInfo{
				PID:  p.Pid,
				Name: name,
				CPU:  cpu,
				User: username,
			})
		}
	}

	// Sort by CPU Desc
	sort.Slice(procList, func(i, j int) bool {
		return procList[i].CPU > procList[j].CPU
	})

	// Keep Top 10
	if len(procList) > 10 {
		procList = procList[:10]
	}

	liveDataMutex.Lock()
	TopProcesses = procList
	liveDataMutex.Unlock()
}

func collectLiveConnections() {
	conns, err := net.Connections("inet")
	if err != nil {
		return
	}

	var connList []ConnectionInfo
	for _, c := range conns {
		if c.Status == "ESTABLISHED" {
			connList = append(connList, ConnectionInfo{
				FD:         c.Fd,
				Family:     c.Family,
				Type:       c.Type,
				LocalIP:    c.Laddr.IP,
				LocalPort:  c.Laddr.Port,
				RemoteIP:   c.Raddr.IP,
				RemotePort: c.Raddr.Port,
				Status:     c.Status,
			})
		}
	}

	// Limit to recent 20 to avoid huge payload
	if len(connList) > 20 {
		connList = connList[:20]
	}

	liveDataMutex.Lock()
	ActiveConnections = connList
	liveDataMutex.Unlock()
}

// GetLiveSnapshot returns a copy of the current live data
func GetLiveSnapshot() ([]ProcessInfo, []ConnectionInfo) {
	liveDataMutex.RLock()
	defer liveDataMutex.RUnlock()

	// Copy slices to avoid races
	pCopy := make([]ProcessInfo, len(TopProcesses))
	copy(pCopy, TopProcesses)

	cCopy := make([]ConnectionInfo, len(ActiveConnections))
	copy(cCopy, ActiveConnections)

	return pCopy, cCopy
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
