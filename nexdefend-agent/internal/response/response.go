package response

import (
	"fmt"
	"log"
	"os"
	"strconv"
)

// Command represents a command received from the SOAR service.
type Command struct {
	Action     string                 `json:"action"`
	Parameters map[string]interface{} `json:"parameters"`
}

// KillProcess attempts to kill a process by its PID.
// It accepts a PID as a string, integer, or float64 (from JSON unmarshal).
func KillProcess(pidVal interface{}) error {
	var pid int
	var err error

	switch v := pidVal.(type) {
	case string:
		pid, err = strconv.Atoi(v)
		if err != nil {
			return err
		}
	case int:
		pid = v
	case float64:
		pid = int(v)
	case int32:
		pid = int(v)
	case int64:
		pid = int(v)
	default:
		return fmt.Errorf("invalid type for PID: %T", pidVal)
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
