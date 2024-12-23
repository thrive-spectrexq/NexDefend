package threat

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/hpcloud/tail" // Tail library for real-time log processing
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
	go watchSuricataLog(store)
}

// watchSuricataLog watches the Suricata log file and processes new events in real-time
func watchSuricataLog(store EventStore) {
	logPath, err := GetSuricataLogPath()
	if err != nil {
		fmt.Printf("Error locating Suricata log: %v\n", err)
		return
	}

	t, err := tail.TailFile(logPath, tail.Config{
		Follow:    true,  // Follow file growth
		MustExist: true,  // Ensure file exists
		Poll:      true,  // Use polling for better compatibility
		ReOpen:    true,  // Reopen file on rotation
	})
	if err != nil {
		fmt.Printf("Error tailing Suricata log: %v\n", err)
		return
	}

	fmt.Printf("Monitoring Suricata log: %s\n", logPath)
	for line := range t.Lines {
		var event map[string]interface{}
		if err := json.Unmarshal([]byte(line.Text), &event); err != nil {
			fmt.Printf("Failed to parse Suricata log line: %v\n", err)
			continue
		}

		suricataEvent, err := ConvertMapToSuricataEvent(event)
		if err != nil {
			fmt.Printf("Failed to convert log to SuricataEvent: %v\n", err)
			continue
		}

		if err := store.StoreSuricataEvent(suricataEvent); err != nil {
			fmt.Printf("Error storing Suricata event: %v\n", err)
		}
	}
}

// ConvertMapToSuricataEvent converts a map to a SuricataEvent struct, parsing timestamps
func ConvertMapToSuricataEvent(event map[string]interface{}) (SuricataEvent, error) {
	var suricataEvent SuricataEvent

	eventData, err := json.Marshal(event)
	if err != nil {
		return suricataEvent, fmt.Errorf("failed to marshal map to JSON: %v", err)
	}
	if err := json.Unmarshal(eventData, &suricataEvent); err != nil {
		return suricataEvent, fmt.Errorf("failed to unmarshal JSON to SuricataEvent: %v", err)
	}

	return suricataEvent, nil
}
