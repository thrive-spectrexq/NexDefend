package handlers

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"gorm.io/gorm"
)

type HostHandler struct {
	db *gorm.DB
}

func NewHostHandler(db *gorm.DB) *HostHandler {
	return &HostHandler{db: db}
}

// GetHostDetails serves the full system info for a specific agent
func (h *HostHandler) GetHostDetails(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	idStr := vars["id"]
	id, _ := strconv.Atoi(idStr)

	// 1. Fetch Basic Asset Info from DB
	var asset models.Asset
	// Note: Ensure your Asset model exists. Using fallback if DB fetch fails for demo.
	if err := h.db.First(&asset, id).Error; err != nil {
		// Mocking for demonstration if DB is empty
		asset = models.Asset{
			Hostname:     "desktop-nexus-01",
			IPAddress:    "192.168.1.105",
			OSVersion:    "Windows 11 Pro 22H2",
			AgentVersion: "v1.2.0",
			Status:       "online",
		}
	}

	// 2. Construct Response (Simulating live telemetry)
	// In production, fetch this from OpenSearch/Redis
	details := models.HostDetails{
		Summary: models.HostSummary{
			Hostname:     asset.Hostname,
			IP:           asset.IPAddress,
			Status:       asset.Status,
			Uptime:       "14 days, 3 hours",
			LastSeen:     time.Now(),
			AgentVersion: asset.AgentVersion,
		},
		System: models.SystemInfo{
			OS:           asset.OSVersion,
			Kernel:       "10.0.22621",
			Architecture: "x86_64",
			Manufacturer: "Dell Inc.",
			Model:        "XPS 15 9520",
			Serial:       "8H2J9K1",
		},
		Resources: models.ResourceUsage{
			CPUPercent:    rand.Float64() * 30, // Mock 0-30%
			MemoryTotal:   32 * 1024 * 1024 * 1024,
			MemoryUsed:    12 * 1024 * 1024 * 1024,
			MemoryPercent: 37.5,
			DiskPercent:   45.2,
		},
		Disks: []models.DiskInfo{
			{MountPoint: "C:", FileSystem: "NTFS", Total: 1024 * 1024 * 1024 * 1024, Used: 400 * 1024 * 1024 * 1024, Free: 624 * 1024 * 1024 * 1024, Percent: 39.0},
			{MountPoint: "D:", FileSystem: "NTFS", Total: 512 * 1024 * 1024 * 1024, Used: 10 * 1024 * 1024 * 1024, Free: 502 * 1024 * 1024 * 1024, Percent: 1.9},
		},
		Network: []models.NetworkIf{
			{Name: "Ethernet 0", IP: "192.168.1.105", MAC: "00:1A:2B:3C:4D:5E", BytesRecv: 10240000, BytesSent: 5120000},
			{Name: "Wi-Fi", IP: "Disconnected", MAC: "00:1A:2B:3C:4D:5F", BytesRecv: 0, BytesSent: 0},
		},
		Processes: []models.ProcessInfo{
			{PID: 452, Name: "chrome.exe", User: "admin", CPU: 2.5, Memory: 1.2, State: "running", StartedAt: "10:00 AM"},
			{PID: 890, Name: "nexdefend-agent.exe", User: "system", CPU: 0.1, Memory: 0.4, State: "running", StartedAt: "08:00 AM"},
			{PID: 112, Name: "svchost.exe", User: "system", CPU: 0.0, Memory: 0.8, State: "running", StartedAt: "08:00 AM"},
			{PID: 6721, Name: "code.exe", User: "admin", CPU: 5.2, Memory: 4.1, State: "running", StartedAt: "11:30 AM"},
		},
		Users: []models.UserInfo{
			{Username: "admin", Terminal: "console", LoginTime: "2023-10-27 08:00:00"},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(details)
}
