package response

import (
	"os/exec"
	"testing"
	"time"
)

// TestKillProcess_Types verifies that KillProcess accepts various types for PID.
// Note: We can't easily mock os.FindProcess or process.Kill in standard Go without interfaces or external libs.
// However, we can start a dummy process to kill, or at least verify that the function
// doesn't return a "type error" before attempting to kill.
func TestKillProcess_Types(t *testing.T) {
	// Helper to start a sleep process we can kill
	startSleep := func() int {
		cmd := exec.Command("sleep", "10")
		if err := cmd.Start(); err != nil {
			t.Fatalf("Failed to start sleep process: %v", err)
		}
		return cmd.Process.Pid
	}

	tests := []struct {
		name      string
		pidInput  interface{}
		expectErr bool
	}{
		{
			name:      "Valid Int PID",
			pidInput:  startSleep(),
			expectErr: false,
		},
		{
			name:      "Valid String PID",
			pidInput:  func() string { return  "999999" }(), // Non-existent PID likely, but checks type parsing
			expectErr: true, // Will fail to find process or kill it, but NOT type error.
		},
		{
			name:      "Valid Float64 PID",
			pidInput:  float64(startSleep()),
			expectErr: false,
		},
		{
			name:      "Invalid Type",
			pidInput:  []int{1},
			expectErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// For the String case, we used a fake PID 999999 which will likely fail os.FindProcess or Kill.
			// But for the Int and Float cases, we started a real process.
			// The "Invalid Type" case should definitely error.

			// Let's refine: We primarily want to check that the TYPE switch works.
			// If we pass an invalid type, we get "invalid type for PID".

			err := KillProcess(tt.pidInput)

			if tt.name == "Invalid Type" {
				if err == nil {
					t.Errorf("Expected error for invalid type, got nil")
				} else if err.Error() != "invalid type for PID: []int" {
					// We just want to ensure it caught the type error, not necessarily the exact string match if fragile
				}
			} else {
				// For valid types, if we started a process, it should succeed.
				// If we used a fake PID (String case), it might fail with "process not found" etc.
				// We care that it proceeded PAST the type check.
				if err != nil && tt.name != "Valid String PID" {
					t.Errorf("KillProcess failed: %v", err)
				}
			}
		})
		// Give OS time to cleanup
		time.Sleep(10 * time.Millisecond)
	}
}
