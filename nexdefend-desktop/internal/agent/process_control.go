package agent

import (
	"fmt"

	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/process"
)

type ProcessDetail struct {
	PID         int32    `json:"pid"`
	Name        string   `json:"name"`
	CommandLine string   `json:"cmdline"`
	Username    string   `json:"username"`
	StartTime   int64    `json:"start_time"`
	OpenFiles   []string `json:"open_files"`
	Connections []string `json:"connections"`
}

// GetProcessDetails fetches deep insight into a specific PID
func GetProcessDetails(pid int32) (*ProcessDetail, error) {
	p, err := process.NewProcess(pid)
	if err != nil {
		return nil, err
	}

	name, _ := p.Name()
	cmd, _ := p.Cmdline()
	user, _ := p.Username()
	create, _ := p.CreateTime()

	// Get Open Files (Limit to 10 for performance)
	files, _ := p.OpenFiles()
	var fileList []string
	for i, f := range files {
		if i >= 10 { break }
		fileList = append(fileList, f.Path)
	}

	// Get Network Connections
	conns, _ := p.Connections()
	var connList []string
	for _, c := range conns {
		if c.Status == "ESTABLISHED" || c.Status == "LISTEN" {
			connList = append(connList, fmt.Sprintf("%s:%d -> %s:%d [%s]",
				c.Laddr.IP, c.Laddr.Port, c.Raddr.IP, c.Raddr.Port, c.Status))
		}
	}

	return &ProcessDetail{
		PID:         pid,
		Name:        name,
		CommandLine: cmd,
		Username:    user,
		StartTime:   create,
		OpenFiles:   fileList,
		Connections: connList,
	}, nil
}

// KillProcess terminates a process immediately
func KillProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return fmt.Errorf("process not found")
	}
	return p.Kill()
}

// GetGlobalConnections returns all active network connections system-wide
func GetGlobalConnections() ([]string, error) {
	conns, err := net.Connections("inet")
	if err != nil {
		return nil, err
	}
	var results []string
	for _, c := range conns {
		results = append(results, fmt.Sprintf("%s:%d > %s:%d (%s)", c.Laddr.IP, c.Laddr.Port, c.Raddr.IP, c.Raddr.Port, c.Status))
	}
	return results, nil
}
