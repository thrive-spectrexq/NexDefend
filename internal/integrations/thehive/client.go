package thehive

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type Client struct {
	URL    string
	APIKey string
}

func NewClient() *Client {
	return &Client{
		URL:    os.Getenv("THEHIVE_URL"),
		APIKey: os.Getenv("THEHIVE_API_KEY"),
	}
}

type Alert struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Type        string   `json:"type"`
	Source      string   `json:"source"`
	SourceRef   string   `json:"sourceRef"`
	Severity    int      `json:"severity"`
	Tags        []string `json:"tags"`
}

func (c *Client) CreateAlert(title, description string, severity int, ref string) error {
	if c.URL == "" {
		return fmt.Errorf("TheHive URL not configured")
	}

    // Map severity string to int if needed, but here we take int
    // TheHive: 1=Low, 2=Medium, 3=High, 4=Critical

	alert := Alert{
		Title:       title,
		Description: description,
		Type:        "external",
		Source:      "NexDefend",
		SourceRef:   ref,
		Severity:    severity,
		Tags:        []string{"nexdefend", "auto-generated"},
	}
	data, _ := json.Marshal(alert)

	req, _ := http.NewRequest("POST", c.URL+"/api/alert", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	if c.APIKey != "" {
		req.Header.Set("Authorization", "Bearer "+c.APIKey)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("failed to create alert in TheHive, status: %d", resp.StatusCode)
	}

	return nil
}
