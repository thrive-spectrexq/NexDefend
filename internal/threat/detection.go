package threat

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"
)

const suricataLogPath = "/var/log/suricata/eve.json"

// Alert represents the structure of Suricata JSON alert logs
type Alert struct {
	Timestamp   string `json:"timestamp"`
	AlertAction string `json:"action"`
	Signature   string `json:"signature"`
	Category    string `json:"category"`
	Severity    int    `json:"severity"`
	SourceIP    string `json:"src_ip"`
	DestIP      string `json:"dest_ip"`
	SourcePort  int    `json:"src_port"`
	DestPort    int    `json:"dest_port"`
}

// StartThreatDetection continuously monitors Suricata logs and processes alerts.
func StartThreatDetection() {
	file, err := os.Open(suricataLogPath)
	if err != nil {
		log.Fatalf("Failed to open Suricata log file: %v", err)
	}
	defer file.Close()

	// Move to the end of the file to read only new entries
	file.Seek(0, os.SEEK_END)
	scanner := bufio.NewScanner(file)

	for {
		for scanner.Scan() {
			line := scanner.Text()
			var alert Alert
			if err := json.Unmarshal([]byte(line), &alert); err != nil {
				log.Printf("Error parsing Suricata JSON alert: %v", err)
				continue
			}
			// Process alert
			handleAlert(alert)
		}
		time.Sleep(1 * time.Second)
	}
}

// handleAlert processes the parsed alert data
func handleAlert(alert Alert) {
	fmt.Printf("ALERT: [%s] %s - %s (Severity: %d)\n", alert.Timestamp, alert.Category, alert.Signature, alert.Severity)
	// You may further analyze or forward these alerts to your application’s central log or dashboard
}
