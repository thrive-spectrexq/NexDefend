
package remediation

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/integrations/firewall"
)

// Scan triggers a scan on the target.
func Scan(target string) {
	log.Printf("Scanning target: %s", target)

	aiURL := os.Getenv("PYTHON_API")
	if aiURL == "" {
		aiURL = "http://nexdefend-ai:5000"
	}
	aiToken := os.Getenv("AI_SERVICE_TOKEN")

	payload := map[string]string{"target": target}
	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		log.Printf("Failed to marshal scan payload: %v", err)
		return
	}

	req, err := http.NewRequest("POST", aiURL+"/scan", bytes.NewBuffer(jsonPayload))
	if err != nil {
		log.Printf("Failed to create scan request: %v", err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	if aiToken != "" {
		req.Header.Set("Authorization", "Bearer "+aiToken)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send scan request: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Scan request failed with status: %d", resp.StatusCode)
	} else {
		log.Printf("Successfully triggered scan for %s", target)
	}
}

// Isolate isolates the target from the network.
func Isolate(target string) {
	log.Printf("Isolating target: %s", target)
	// In a real implementation, you would use a firewall or an EDR agent to isolate the target.
}

// Block blocks the target at the firewall.
func Block(target string) {
	log.Printf("Blocking target: %s", target)

	fw := &firewall.MockFirewall{}
	if err := fw.BlockIP(target); err != nil {
		log.Printf("Failed to block IP address %s: %v", target, err)
	}
}

// DisableUser disables a user in Active Directory.
func DisableUser(username string) {
	log.Printf("Disabling user: %s", username)
	// In a real implementation, you would use the Active Directory API to disable the user.
}
