package response

import (
	"log"
	"os"
	"strconv"
)

// Command represents a command received from the SOAR service.
type Command struct {
	Action     string            `json:"action"`
	Parameters map[string]string `json:"parameters"`
}

// KillProcess attempts to kill a process by its PID.
func KillProcess(pidStr string) error {
	pid, err := strconv.Atoi(pidStr)
	if err != nil {
		return err
	}

	process, err := os.FindProcess(pid)
	if err != nil {
		return err
	}

	if err := process.Kill(); err != nil {
		return err
	}

	log.Printf("Successfully killed process with PID: %d", pid)
	return nil
}
