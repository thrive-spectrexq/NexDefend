package threat

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
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

// StartThreatDetection initializes and monitors Suricata events with a provided EventStore
func StartThreatDetection(store EventStore) {
	go monitorSuricataEvents(store)
}

// ConvertMapToSuricataEvent converts a map to a SuricataEvent struct, parsing timestamps
func ConvertMapToSuricataEvent(event map[string]interface{}) (SuricataEvent, error) {
	var suricataEvent SuricataEvent

	// Convert other fields by unmarshalling directly from the event map
	eventData, err := json.Marshal(event)
	if err != nil {
		return suricataEvent, fmt.Errorf("failed to marshal map to JSON: %v", err)
	}
	if err := json.Unmarshal(eventData, &suricataEvent); err != nil {
		return suricataEvent, fmt.Errorf("failed to unmarshal JSON to SuricataEvent: %v", err)
	}

	return suricataEvent, nil
}

// monitorSuricataEvents reads and processes Suricata’s JSON logs in real-time
func monitorSuricataEvents(store EventStore) {
	suricataLogPath, err := GetSuricataLogPath()
	if err != nil {
		return
	}

	for {
		file, err := os.Open(suricataLogPath)
		if err != nil {
			continue
		}

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			var event map[string]interface{}
			line := scanner.Text()

			if err := json.Unmarshal([]byte(line), &event); err != nil {
				continue
			}

			// Convert the map to a SuricataEvent struct before storing
			suricataEvent, err := ConvertMapToSuricataEvent(event)
			if err != nil {
				continue
			}

			// Store the event
			if err := store.StoreSuricataEvent(suricataEvent); err != nil {
				continue
			}
		}

		file.Close()
		time.Sleep(2 * time.Second)
	}
}
