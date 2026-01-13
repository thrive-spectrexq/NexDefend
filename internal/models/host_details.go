package models

import "time"

// HostDetails Aggregates all system information for a specific agent
type HostDetails struct {
	Summary    HostSummary    `json:"summary"`
	System     SystemInfo     `json:"system"`
	Resources  ResourceUsage  `json:"resources"`
	Network    []NetworkIf    `json:"network"`
	Processes  []ProcessInfo  `json:"processes"`
	Disks      []DiskInfo     `json:"disks"`
	Users      []UserInfo     `json:"users"`
}

type HostSummary struct {
	Hostname      string    `json:"hostname"`
	IP            string    `json:"ip"`
	Status        string    `json:"status"` // online, offline
	Uptime        string    `json:"uptime"`
	LastSeen      time.Time `json:"last_seen"`
	AgentVersion  string    `json:"agent_version"`
}

type SystemInfo struct {
	OS           string `json:"os"`
	Kernel       string `json:"kernel"`
	Architecture string `json:"architecture"`
	Manufacturer string `json:"manufacturer"`
	Model        string `json:"model"`
	Serial       string `json:"serial"`
}

type ResourceUsage struct {
	CPUPercent    float64 `json:"cpu_percent"`
	MemoryUsed    uint64  `json:"memory_used"`
	MemoryTotal   uint64  `json:"memory_total"`
	MemoryPercent float64 `json:"memory_percent"`
	DiskPercent   float64 `json:"disk_percent"` // Root partition
}

type ProcessInfo struct {
	PID       int     `json:"pid"`
	Name      string  `json:"name"`
	User      string  `json:"user"`
	CPU       float64 `json:"cpu"`
	Memory    float64 `json:"memory"`
	State     string  `json:"state"`
	StartedAt string  `json:"started_at"`
}

type NetworkIf struct {
	Name      string `json:"name"`
	MAC       string `json:"mac"`
	IP        string `json:"ip"`
	BytesSent uint64 `json:"bytes_sent"`
	BytesRecv uint64 `json:"bytes_recv"`
}

type DiskInfo struct {
	MountPoint  string  `json:"mount_point"`
	FileSystem  string  `json:"filesystem"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	Percent     float64 `json:"percent"`
}

type UserInfo struct {
	Username string `json:"username"`
	Terminal string `json:"terminal"`
	LoginTime string `json:"login_time"`
}
