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

const (
	defaultLogPath       = "/var/log/suricata/eve.json"
	sourceInstallLogPath = "/usr/local/var/log/suricata/eve.json"
)

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
		Query  interface{} `json:"query"` // Now an interface to handle both string and array
		Answer string      `json:"answer"`
	} `json:"dns"`
	Alert struct {
		SignatureID int    `json:"signature_id"`
		Signature   string `json:"signature"`
		Category    string `json:"category"`
	} `json:"alert"`
}

// GetSuricataLogPath returns the appropriate Suricata log path based on availability
func GetSuricataLogPath() (string, error) {
	if _, err := os.Stat(defaultLogPath); err == nil {
		return defaultLogPath, nil
	} else if _, err := os.Stat(sourceInstallLogPath); err == nil {
		return sourceInstallLogPath, nil
	}
	return "", fmt.Errorf("no Suricata log file found at %s or %s", defaultLogPath, sourceInstallLogPath)
}

// GetSuricataCommand returns the appropriate Suricata binary and config path
func GetSuricataCommand() (*exec.Cmd, error) {
	var suricataPath, configPath, iface string

	// Determine binary and config paths
	suricataPath, configPath, iface, err := findSuricataPaths()
	if err != nil {
		return nil, err
	}

	return exec.Command(suricataPath, "-c", configPath, "-i", iface), nil
}

// findSuricataPaths checks standard paths for Suricata binary, config, and network interface
func findSuricataPaths() (string, string, string, error) {
	var suricataPath, configPath, iface string

	if _, err := os.Stat("/usr/bin/suricata"); err == nil {
		suricataPath = "/usr/bin/suricata"
	} else if _, err := os.Stat("/usr/local/bin/suricata"); err == nil {
		suricataPath = "/usr/local/bin/suricata"
	} else {
		return "", "", "", fmt.Errorf("suricata binary not found in standard paths")
	}

	if _, err := os.Stat("/etc/suricata/suricata.yaml"); err == nil {
		configPath = "/etc/suricata/suricata.yaml"
	} else if _, err := os.Stat("/usr/local/etc/suricata/suricata.yaml"); err == nil {
		configPath = "/usr/local/etc/suricata/suricata.yaml"
	} else {
		return "", "", "", fmt.Errorf("suricata config file not found in standard paths")
	}

	if _, err := os.Stat("/sys/class/net/eth0"); err == nil {
		iface = "eth0"
	} else if _, err := os.Stat("/sys/class/net/wlan0"); err == nil {
		iface = "wlan0"
	} else {
		return "", "", "", fmt.Errorf("no suitable network interface found")
	}

	return suricataPath, configPath, iface, nil
}

// StartThreatDetection initializes and monitors Suricata events with a provided EventStore
func StartThreatDetection(store EventStore) {
	go startSuricataDaemon()
	go monitorSuricataEvents(store)
}

// startSuricataDaemon launches the Suricata process
func startSuricataDaemon() {
	cmd, err := GetSuricataCommand()
	if err != nil {
		log.Fatalf("Failed to configure Suricata: %v", err)
	}
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
	suricataLogPath, err := GetSuricataLogPath()
	if err != nil {
		log.Fatalf("Error: %v", err)
		return
	}

	for {
		file, err := os.Open(suricataLogPath)
		if err != nil {
			log.Fatalf("Failed to open Suricata log file: %v", err)
		}

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			var event SuricataEvent
			line := scanner.Text()

			if err := json.Unmarshal([]byte(line), &event); err != nil {
				log.Printf("Failed to parse JSON line: %v", err)
				continue
			}

			// Process and store the event
			processEvent(event)
			if err := store.StoreSuricataEvent(event); err != nil {
				log.Printf("Failed to store Suricata event: %v", err)
			}
		}

		if err := scanner.Err(); err != nil {
			log.Printf("Error reading log file: %v", err)
		}

		file.Close()
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
	switch query := event.DNS.Query.(type) {
	case string:
		log.Printf("DNS Event - Query: %s, Answer: %s", query, event.DNS.Answer)
	case []interface{}:
		for _, q := range query {
			log.Printf("DNS Event - Query: %v, Answer: %s", q, event.DNS.Answer)
		}
	default:
		log.Printf("DNS Event - Unexpected Query type: %v, Answer: %s", query, event.DNS.Answer)
	}
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
