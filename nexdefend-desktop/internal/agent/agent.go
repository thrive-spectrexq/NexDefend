package agent

import (
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
)

type SystemStats struct {
	CPUUsage    float64 `json:"cpu_usage"`
	MemoryUsage float64 `json:"memory_usage"`
	DiskUsage   float64 `json:"disk_usage"`
}

type ProcessInfo struct {
	PID  int32  `json:"pid"`
	Name string `json:"name"`
	User string `json:"user"`
}

// GetSystemStats collects real-time resource usage
func GetSystemStats() (*SystemStats, error) {
	v, err := mem.VirtualMemory()
	if err != nil {
		return nil, err
	}

	c, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, err
	}

	d, err := disk.Usage("/")
	if err != nil {
		return nil, err
	}

	return &SystemStats{
		CPUUsage:    c[0],
		MemoryUsage: v.UsedPercent,
		DiskUsage:   d.UsedPercent,
	}, nil
}

// StartAgent starts background data collection (Mock implementation for now)
func StartAgent() {
	// In a real implementation, this would start goroutines for periodic collection
	fmt.Println("Desktop Agent Started...")
}

// GetTopProcesses collects active processes
func GetTopProcesses(limit int) ([]ProcessInfo, error) {
	procs, err := process.Processes()
	if err != nil {
		return nil, err
	}

	var result []ProcessInfo
	count := 0
	for _, p := range procs {
		if count >= limit {
			break
		}
		name, _ := p.Name()
		username, _ := p.Username()

		result = append(result, ProcessInfo{
			PID:  p.Pid,
			Name: name,
			User: username,
		})
		count++
	}
	return result, nil
}

// CheckFileIntegrity hashes a file to check for changes
func CheckFileIntegrity(path string, knownHash string) (string, bool, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", false, err
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", false, err
	}

	currentHash := fmt.Sprintf("%x", h.Sum(nil))

	// If knownHash is empty, it's a new file baseline
	if knownHash == "" {
		return currentHash, false, nil
	}

	if currentHash != knownHash {
		return currentHash, true, nil // True = Modified
	}

	return currentHash, false, nil
}

// GetLiveSnapshot mocks real-time data for demo purposes,
// maintaining compatibility with legacy handlers.
// TODO: Replace usage of this function with GetTopProcesses and GetSystemStats calls.
func GetLiveSnapshot() ([]map[string]interface{}, []map[string]interface{}) {
    // Mock processes
    procs := []map[string]interface{}{
        {"pid": 1024, "name": "chrome.exe", "user": "Admin", "cpu": 12.5, "status": "Running"},
        {"pid": 8080, "name": "nexdefend-agent", "user": "SYSTEM", "cpu": 4.2, "status": "Running"},
        {"pid": 443, "name": "svchost.exe", "user": "SYSTEM", "cpu": 1.1, "status": "Running"},
        {"pid": 0, "name": "System Idle", "user": "SYSTEM", "cpu": 82.2, "status": "Running"},
    }

    // Mock connections
    conns := []map[string]interface{}{
        {"id": "c1", "proto": "TCP", "local": "192.168.1.50:54321", "remote": "104.21.55.2:443", "state": "ESTABLISHED", "process": "chrome.exe"},
        {"id": "c2", "proto": "TCP", "local": "192.168.1.50:22", "remote": "10.0.0.5:55662", "state": "ESTABLISHED", "process": "sshd"},
    }

    return procs, conns
}
