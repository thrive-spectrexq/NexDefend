package compliance

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// ComplianceResult represents the result of a compliance check.
type ComplianceResult struct {
	CheckName string    `json:"checkName"`
	Status    string    `json:"status"`    // Pass or Fail
	Details   string    `json:"details"`   // Description of the result
	Timestamp time.Time `json:"timestamp"` // When the check was executed
}

// RunComplianceChecks executes real CIS-style benchmarks
func RunComplianceChecks() []ComplianceResult {
	var results []ComplianceResult

	results = append(results, checkSSHRootLogin())
	results = append(results, checkShadowFilePerms())
	results = append(results, checkIPForwarding())
	results = append(results, checkDockerSocketSecurity())

	for _, res := range results {
		logCompliance(res)
	}
	return results
}

// Check 1: Ensure SSH Root Login is disabled
func checkSSHRootLogin() ComplianceResult {
	path := "/etc/ssh/sshd_config"
	file, err := os.Open(path)
	if err != nil {
		return fail("SSH Root Login", fmt.Sprintf("Could not open %s", path))
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		// Look for PermitRootLogin no
		if strings.HasPrefix(line, "PermitRootLogin") {
			if strings.Contains(line, "no") {
				return pass("SSH Root Login", "Root login is disabled.")
			}
			return fail("SSH Root Login", fmt.Sprintf("Root login configuration found but not set to 'no': %s", line))
		}
	}
	return fail("SSH Root Login", "PermitRootLogin configuration not found (default might be yes).")
}

// Check 2: Ensure /etc/shadow permissions are 0000 or 0600 (very restricted)
func checkShadowFilePerms() ComplianceResult {
	info, err := os.Stat("/etc/shadow")
	if err != nil {
		return fail("Shadow File Permissions", "Could not check /etc/shadow")
	}

	mode := info.Mode().Perm()
	// Check if mode is 0000 (0) or 0600 (384) or 0400 (256)
	if mode == 0 || mode == 0600 || mode == 0400 {
		return pass("Shadow File Permissions", fmt.Sprintf("Permissions are secure: %v", mode))
	}

	return fail("Shadow File Permissions", fmt.Sprintf("Permissions are too open: %v", mode))
}

// Check 3: Ensure IP Forwarding is disabled (for non-routers)
func checkIPForwarding() ComplianceResult {
	content, err := os.ReadFile("/proc/sys/net/ipv4/ip_forward")
	if err != nil {
		return fail("IP Forwarding", "Could not read /proc/sys/net/ipv4/ip_forward")
	}

	value := strings.TrimSpace(string(content))
	if value == "0" {
		return pass("IP Forwarding", "IP Forwarding is disabled.")
	}
	return fail("IP Forwarding", "IP Forwarding is enabled (1).")
}

// Check 4: Ensure Docker Socket is not world-writable
func checkDockerSocketSecurity() ComplianceResult {
	path := "/var/run/docker.sock"
	info, err := os.Stat(path)
	if os.IsNotExist(err) {
		return pass("Docker Socket Security", "Docker socket not present (Service might not be installed).")
	}
	if err != nil {
		return fail("Docker Socket Security", fmt.Sprintf("Could not check %s: %v", path, err))
	}

	mode := info.Mode().Perm()
	// Check if "others" have write permission (mask 0002)
	// 0660 is standard secure (rw-rw----). 0666 is insecure (rw-rw-rw-).
	if mode&0002 != 0 {
		return fail("Docker Socket Security", fmt.Sprintf("Docker socket is world-writable (Permissions: %v). Critical Risk!", mode))
	}

	return pass("Docker Socket Security", "Docker socket permissions are secure.")
}

// Helpers
func pass(name, details string) ComplianceResult {
	return ComplianceResult{CheckName: name, Status: "Pass", Details: details, Timestamp: time.Now()}
}

func fail(name, details string) ComplianceResult {
	return ComplianceResult{CheckName: name, Status: "Fail", Details: details, Timestamp: time.Now()}
}

func logCompliance(result ComplianceResult) {
	if result.Status == "Fail" {
		log.Printf("[COMPLIANCE] VIOLATION: %s - %s", result.CheckName, result.Details)
	} else {
		log.Printf("[COMPLIANCE] PASS: %s", result.CheckName)
	}
}
