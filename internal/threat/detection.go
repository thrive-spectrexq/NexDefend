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
		Query  interface{} `json:"query"`
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

// ConvertMapToSuricataEvent converts a map to a SuricataEvent struct, parsing timestamps.
func ConvertMapToSuricataEvent(event map[string]interface{}) (SuricataEvent, error) {
	var suricataEvent SuricataEvent

	// Parse and validate the timestamp from the map
	if timestamp, ok := event["timestamp"].(string); ok {
		if parsedTime, err := parseTimestamp(timestamp); err == nil {
			suricataEvent.Timestamp = parsedTime.Format(time.RFC3339)
		} else {
			log.Printf("Warning: Invalid timestamp format: %v", err)
		}
	} else {
		return suricataEvent, fmt.Errorf("missing or invalid timestamp field")
	}

	// Convert other fields by unmarshalling directly from the event map to avoid double parsing
	eventData, err := json.Marshal(event)
	if err != nil {
		return suricataEvent, fmt.Errorf("failed to marshal map to JSON: %v", err)
	}
	if err := json.Unmarshal(eventData, &suricataEvent); err != nil {
		return suricataEvent, fmt.Errorf("failed to unmarshal JSON to SuricataEvent: %v", err)
	}

	return suricataEvent, nil
}

// parseTimestamp converts a timestamp string to time.Time for consistent storage
func parseTimestamp(timestamp string) (time.Time, error) {
	t, err := time.Parse(time.RFC3339, timestamp)
	if err != nil {
		return time.Time{}, fmt.Errorf("invalid timestamp format: %v", err)
	}
	return t, nil
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
			var event map[string]interface{}
			line := scanner.Text()

			if err := json.Unmarshal([]byte(line), &event); err != nil {
				log.Printf("Failed to parse JSON line: %v", err)
				continue
			}

			handleSuricataEvent(event)

			// Convert the map to a SuricataEvent struct before storing
			suricataEvent, err := ConvertMapToSuricataEvent(event)
			if err != nil {
				log.Printf("Failed to convert map to SuricataEvent: %v", err)
				continue
			}

			if err := store.StoreSuricataEvent(suricataEvent); err != nil {
				log.Printf("Failed to store Suricata event: %v", err)
			}
		}

		if err := scanner.Err(); err != nil {
			log.Printf("Error reading log file: %v", err)
		}

		file.Close()
		time.Sleep(2 * time.Second)
	}
}

// handleSuricataEvent processes Suricata events based on their type
func handleSuricataEvent(event map[string]interface{}) {
	eventType, ok := event["event_type"].(string)
	if !ok {
		log.Println("Unknown event type")
		return
	}

	switch eventType {
	case "alert":
		// Handle alert events
	case "dns":
		queryType, _ := event["dns"].(map[string]interface{})["query_type"].(string)
		answer, _ := event["dns"].(map[string]interface{})["answer"].(string)
		if queryType != "" && answer != "" {
			log.Printf("DNS Event - Query type: %s, Answer: %s", queryType, answer)
		} else {
			log.Println("DNS Event - Incomplete data")
		}
	case "tls":
		sni, _ := event["tls"].(map[string]interface{})["sni"].(string)
		cipher, _ := event["tls"].(map[string]interface{})["cipher"].(string)
		subject, _ := event["tls"].(map[string]interface{})["subject"].(string)
		issuerDN, _ := event["tls"].(map[string]interface{})["issuerdn"].(string)
		if sni != "" || cipher != "" || subject != "" || issuerDN != "" {
			log.Printf("TLS Event - SNI: %s, Cipher: %s, Subject: %s, IssuerDN: %s", sni, cipher, subject, issuerDN)
		} else {
			log.Println("TLS Event - Incomplete data")
		}
	case "flow":
		// Optionally handle flow events or ignore them
	case "quic":
		// Optionally handle quic events or ignore them
	case "stats":
		// Optionally handle stats events or ignore them
	default:
		log.Printf("Unhandled event type: %s", eventType)
	}
}
