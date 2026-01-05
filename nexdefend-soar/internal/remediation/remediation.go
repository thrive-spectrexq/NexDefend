package remediation

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"
)

// Scan triggers a scan on the target via the AI service (kept from original, ensured context).
func Scan(target string) {
	log.Printf("Triggering scan on target: %s", target)

	aiURL := os.Getenv("PYTHON_API")
	if aiURL == "" { aiURL = "http://nexdefend-ai:5000" }

	postJSON(aiURL+"/scan", map[string]string{"target": target})
}

// Block implements real network blocking using host firewall (iptables/netsh)
func Block(targetIP string) {
	log.Printf("Executing Block Action for IP: %s", targetIP)

	var cmd *exec.Cmd

	if runtime.GOOS == "linux" {
		// Linux: iptables -A INPUT -s [IP] -j DROP
		cmd = exec.Command("iptables", "-A", "INPUT", "-s", targetIP, "-j", "DROP")
	} else if runtime.GOOS == "windows" {
		// Windows: netsh advfirewall firewall add rule name="Block [IP]" dir=in action=block remoteip=[IP]
		ruleName := fmt.Sprintf("NexDefend Block %s", targetIP)
		cmd = exec.Command("netsh", "advfirewall", "firewall", "add", "rule", "name="+ruleName, "dir=in", "action=block", "remoteip="+targetIP)
	} else {
		log.Printf("Unsupported OS for local remediation: %s", runtime.GOOS)
		return
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Failed to block IP %s: %v, Output: %s", targetIP, err, string(output))
	} else {
		log.Printf("Successfully blocked IP %s", targetIP)
	}
}

// Isolate cuts network access for a specific interface
func Isolate(interfaceName string) {
	log.Printf("Isolating Network Interface: %s", interfaceName)

	var cmd *exec.Cmd
	if runtime.GOOS == "linux" {
		cmd = exec.Command("ip", "link", "set", interfaceName, "down")
	} else {
		log.Println("Isolation not implemented for this OS")
		return
	}

	if err := cmd.Run(); err != nil {
		log.Printf("Failed to isolate interface %s: %v", interfaceName, err)
	}
}

// DisableUser calls the internal API to disable a user (connecting to Real AD logic implemented previously)
func DisableUser(username string) {
	log.Printf("Disabling user account: %s", username)

	// Assuming an internal API endpoint exists for user management from the previous steps
	apiURL := os.Getenv("API_URL")
	if apiURL == "" { apiURL = "http://api:8080/api/v1" }

	// Call the endpoint that uses the Real LDAP connector
	url := fmt.Sprintf("%s/enrichment/users/%s/disable", apiURL, username)
	postJSON(url, nil)
}

// Helper for sending JSON requests
func postJSON(url string, data interface{}) {
	jsonPayload, _ := json.Marshal(data)
	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonPayload))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+os.Getenv("AI_SERVICE_TOKEN"))

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed request to %s: %v", url, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("Request to %s failed with status: %d", url, resp.StatusCode)
	}
}
