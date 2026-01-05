package tip

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type TIP interface {
	CheckIOC(ioc string) (bool, error)
}

// VirusTotalTIP implements TIP using the VirusTotal API v3
type VirusTotalTIP struct {
	APIKey string
}

func NewTIP(apiKey string) *VirusTotalTIP {
	return &VirusTotalTIP{APIKey: apiKey}
}

// CheckIOC queries VirusTotal for the given IP address
func (t *VirusTotalTIP) CheckIOC(ip string) (bool, error) {
	if t.APIKey == "" {
		return false, fmt.Errorf("VirusTotal API key not configured")
	}

	client := &http.Client{Timeout: 10 * time.Second}
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/ip_addresses/%s", ip)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("x-apikey", t.APIKey)
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return false, nil // IP not found in VT database
	}
	if resp.StatusCode != 200 {
		return false, fmt.Errorf("VirusTotal API returned status: %d", resp.StatusCode)
	}

	// VirusTotal v3 JSON Structure
	var result struct {
		Data struct {
			Attributes struct {
				LastAnalysisStats struct {
					Malicious int `json:"malicious"`
					Suspicious int `json:"suspicious"`
				} `json:"last_analysis_stats"`
			} `json:"attributes"`
		} `json:"data"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}

	// Consider it a threat if at least one engine flags it as malicious
	stats := result.Data.Attributes.LastAnalysisStats
	return (stats.Malicious > 0), nil
}
