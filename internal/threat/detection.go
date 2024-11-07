package threat

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"time"
)

const suricataLogPath = "/var/log/suricata/eve.json"

// SuricataEvent represents a structure for parsed Suricata JSON logs
type SuricataEvent struct {
	Timestamp string `json:"timestamp"`
	EventType string `json:"event_type"`
	HTTP      struct {
		Hostname string `json:"hostname"`
		URL      string `json:"url"`
		Method   string `json:"http_method"`
	} `json:"http"`
	TLS struct {
		SNI            string `json:"tls.sni"`
		Cipher         string `json:"tls.cipher"`
		Subject        string `json:"tls.subject"`
		IssuerDN       string `json:"tls.issuerdn"`
		NotValidBefore string `json:"tls.notvalidbefore"`
		NotValidAfter  string `json:"tls.notvalidafter"`
	} `json:"tls"`
	DNS struct {
		Query  string `json:"query"`
		Answer string `json:"answer"`
	} `json:"dns"`
	Alert struct {
		SignatureID int    `json:"signature_id"`
		Signature   string `json:"signature"`
		Category    string `json:"category"`
	} `json:"alert"`
}

// StartThreatDetection initializes and monitors Suricata events with a provided EventStore
func StartThreatDetection(store EventStore) {
	go startSuricataDaemon()
	go monitorSuricataEvents(store)
}

// startSuricataDaemon launches the Suricata process
func startSuricataDaemon() {
	cmd := exec.Command("suricata", "-c", "/etc/suricata/suricata.yaml", "-i", "eth0")
	if err := cmd.Start(); err != nil {
		log.Fatalf("Failed to start Suricata: %v", err)
	}
	log.Println("Suricata daemon started successfully")

	go func() {
		if err := cmd.Wait(); err != nil {
			log.Printf("Suricata daemon exited: %v", err)
		}
	}()
}

// monitorSuricataEvents reads and processes Suricata’s JSON logs in real-time
func monitorSuricataEvents(store EventStore) {
	for {
		file, err := os.Open(suricataLogPath)
		if err != nil {
			log.Fatalf("Failed to open Suricata log file: %v", err)
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			var event SuricataEvent
			line := scanner.Text()

			if err := json.Unmarshal([]byte(line), &event); err != nil {
				log.Printf("Failed to parse JSON line: %v", err)
				continue
			}

			// Store the event using the provided store instance
			if err := store.StoreSuricataEvent(event); err != nil {
				log.Printf("Failed to store Suricata event: %v", err)
			}
		}

		if err := scanner.Err(); err != nil {
			log.Printf("Error reading log file: %v", err)
		}

		time.Sleep(2 * time.Second) // Avoid high CPU usage
	}
}

// processEvent handles each parsed event from Suricata
func processEvent(event SuricataEvent) {
	switch event.EventType {
	case "http":
		logHTTPEvent(event)
	case "tls":
		logTLSEvent(event)
	case "dns":
		logDNSEvent(event)
	case "alert":
		logAlertEvent(event)
	default:
		log.Printf("Unhandled event type: %s", event.EventType)
	}
}

// logHTTPEvent processes HTTP events from Suricata
func logHTTPEvent(event SuricataEvent) {
	log.Printf("HTTP Event - Hostname: %s, URL: %s, Method: %s",
		event.HTTP.Hostname, event.HTTP.URL, event.HTTP.Method)
}

// logTLSEvent processes TLS/SSL events from Suricata
func logTLSEvent(event SuricataEvent) {
	log.Printf("TLS Event - SNI: %s, Cipher: %s, Subject: %s, IssuerDN: %s",
		event.TLS.SNI, event.TLS.Cipher, event.TLS.Subject, event.TLS.IssuerDN)
}

// logDNSEvent processes DNS events from Suricata
func logDNSEvent(event SuricataEvent) {
	log.Printf("DNS Event - Query: %s, Answer: %s", event.DNS.Query, event.DNS.Answer)
}

// logAlertEvent processes IDS/IPS alert events
func logAlertEvent(event SuricataEvent) {
	log.Printf("Alert - Signature ID: %d, Signature: %s, Category: %s",
		event.Alert.SignatureID, event.Alert.Signature, event.Alert.Category)
}

// parseTimestamp converts a timestamp string to time.Time for consistent storage
func parseTimestamp(timestamp string) (time.Time, error) {
	t, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid timestamp format: %v", err)
	}
	return t, nil
}
