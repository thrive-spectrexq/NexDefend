package threat

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/hpcloud/tail" // Tail library for real-time log processing
)

const (
	defaultLogPath       = "/var/log/suricata/eve.json"
	sourceInstallLogPath = "/usr/local/var/log/suricata/eve.json"
	sampleLogPath        = "./sample_eve.json" // Added for local dev
)

var (
	PYTHON_API_URL string
	AI_SERVICE_TOKEN string
)

// InitDetection configures the threat detection service
func InitDetection(pythonAPI, aiToken string) {
	PYTHON_API_URL = pythonAPI
	if PYTHON_API_URL == "" {
		PYTHON_API_URL = "http://localhost:5000" // Default for local dev
	}
	AI_SERVICE_TOKEN = aiToken
}

// ... (SuricataEvent struct is unchanged) ...
type SuricataEvent struct {
	Timestamp string `json:"timestamp"`
	EventType string `json:"event_type"`
	SrcIP     string `json:"src_ip"`
	DestIP    string `json:"dest_ip"`
	DestPort  int    `json:"dest_port"`
	Proto     string `json:"proto"`
	HTTP      struct {
		Hostname string `json:"hostname"`
		URL      string `json:"url"`
		Method   string `json:"http_method"`
		Status   int    `json:"status"`
		Length   int64  `json:"length"`
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
		Query  interface{} `json:"query"` // Can be map or string
		Answer string      `json:"answer"`
		RRName string      `json:"rrname"`
		RRType string      `json:"rrtype"`
	} `json:"dns"`
	Alert struct {
		SignatureID int    `json:"signature_id"`
		Signature   string `json:"signature"`
		Category    string `json:"category"`
		Severity    int    `json:"severity"`
	} `json:"alert"`
}


// GetSuricataLogPath returns the appropriate Suricata log path based on availability
func GetSuricataLogPath() (string, error) {
	if _, err := os.Stat(defaultLogPath); err == nil {
		return defaultLogPath, nil
	} else if _, err := os.Stat(sourceInstallLogPath); err == nil {
		return sourceInstallLogPath, nil
	} else if _, err := os.Stat(sampleLogPath); err == nil {
		log.Println("Using ./sample_eve.json for development.")
		return sampleLogPath, nil // Use sample file for dev
	}
	return "", fmt.Errorf("no Suricata log file found at %s, %s, or %s", defaultLogPath, sourceInstallLogPath, sampleLogPath)
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
		Follow:    true,
		MustExist: true,
		Poll:      true, // Use polling for container environments
		ReOpen:    true,
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

		eventID, err := store.StoreSuricataEvent(suricataEvent)
		if err != nil {
			fmt.Printf("Error storing Suricata event: %v\n", err)
			continue
		}

		// Trigger real-time analysis after storing the event
		go triggerAnalysis(eventID)
	}
}

// triggerAnalysis makes an API call to the Python service to analyze a specific event
func triggerAnalysis(eventID int) {
	url := fmt.Sprintf("%s/analyze-event/%d", PYTHON_API_URL, eventID)

	// Create a new request
	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte{})) // Empty body
	if err != nil {
		log.Printf("Error creating analysis request for event %d: %v", eventID, err)
		return
	}

	// Add the service-to-service authorization header
	req.Header.Set("Authorization", "Bearer "+AI_SERVICE_TOKEN)
	req.Header.Set("Content-Type", "application/json")

	// Send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Error triggering analysis for event %d: %v", eventID, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Analysis for event %d failed with status: %s", eventID, resp.Status)
		return
	}

	log.Printf("Successfully triggered analysis for event %d", eventID)
}


// ConvertMapToSuricataEvent converts a map to a SuricataEvent struct, parsing timestamps
func ConvertMapToSuricataEvent(event map[string]interface{}) (SuricataEvent, error) {
	var suricataEvent SuricataEvent

	// Manually map fields to handle different types and nesting
	if ts, ok := event["timestamp"].(string); ok {
		suricataEvent.Timestamp = ts
	}
	if et, ok := event["event_type"].(string); ok {
		suricataEvent.EventType = et
	}
	if si, ok := event["src_ip"].(string); ok {
		suricataEvent.SrcIP = si
	}
	if di, ok := event["dest_ip"].(string); ok {
		suricataEvent.DestIP = di
	}
	if dp, ok := event["dest_port"].(float64); ok { // JSON numbers are float64
		suricataEvent.DestPort = int(dp)
	}
	if p, ok := event["proto"].(string); ok {
		suricataEvent.Proto = p
	}

	// Use json.Marshal/Unmarshal for nested structs
	if httpData, ok := event["http"]; ok {
		j, _ := json.Marshal(httpData)
		json.Unmarshal(j, &suricataEvent.HTTP)
	}
	if tlsData, ok := event["tls"]; ok {
		j, _ := json.Marshal(tlsData)
		json.Unmarshal(j, &suricataEvent.TLS)
	}
	if dnsData, ok := event["dns"]; ok {
		j, _ := json.Marshal(dnsData)
		json.Unmarshal(j, &suricataEvent.DNS)
	}
	if alertData, ok := event["alert"]; ok {
		j, _ := json.Marshal(alertData)
		json.Unmarshal(j, &suricataEvent.Alert)
	}

	return suricataEvent, nil
}
