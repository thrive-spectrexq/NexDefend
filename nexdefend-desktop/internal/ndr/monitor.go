package ndr

import (
	"fmt"
	"time"

	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
	"nexdefend-desktop/internal/bus"
)

// NetworkFlow represents a single connection event
type NetworkFlow struct {
	PID        int32  `json:"pid"`
	Process    string `json:"process_name"`
	LocalIP    string `json:"local_ip"`
	RemoteIP   string `json:"remote_ip"`
	RemotePort uint32 `json:"remote_port"`
	Status     string `json:"status"`
	Timestamp  string `json:"timestamp"`
}

// StartMonitoring begins the background collection loop
func StartMonitoring() {
	go func() {
		ticker := time.NewTicker(2 * time.Second)
		for range ticker.C {
			collectConnections()
		}
	}()
}

func collectConnections() {
	// Get all TCP/UDP connections
	conns, err := net.Connections("inet")
	if err != nil {
		return
	}

	// Simple cache to avoid looking up Process Name every single time for the same PID
	procCache := make(map[int32]string)

	for _, c := range conns {
		// We care mostly about established connections or listeners
		if c.Status != "ESTABLISHED" && c.Status != "LISTEN" {
			continue
		}

		name, ok := procCache[c.Pid]
		if !ok {
			if p, err := process.NewProcess(c.Pid); err == nil {
				name, _ = p.Name()
			} else {
				name = "unknown"
			}
			procCache[c.Pid] = name
		}

		flow := NetworkFlow{
			PID:        c.Pid,
			Process:    name,
			LocalIP:    c.Laddr.IP,
			RemoteIP:   c.Raddr.IP,
			RemotePort: c.Raddr.Port,
			Status:     c.Status,
			Timestamp:  time.Now().Format(time.RFC3339),
		}

		// 1. Publish to Bus for Indexing
		bus.GetBus().Publish(bus.EventNetFlow, flow)

		// 2. Simple "Signature" Detection (Embedded Suricata Logic)
		detectThreats(name, flow)
	}
}

func detectThreats(procName string, flow NetworkFlow) {
	// Example Rule: Alert if "nc" (netcat) or "powershell" opens a remote connection
	if (procName == "nc" || procName == "ncat" || procName == "powershell.exe") && flow.Status == "ESTABLISHED" {
		alert := map[string]string{
			"severity": "CRITICAL",
			"message":  fmt.Sprintf("Suspicious shell connection detected: %s -> %s:%d", procName, flow.RemoteIP, flow.RemotePort),
			"source":   "Embedded-NDR",
		}
		bus.GetBus().Publish(bus.EventSecurityAlert, alert)
	}
}
