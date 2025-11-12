package main

import (
	"encoding/json"
	"log"
	"net/http"
	"bytes"
	"os"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

// Incident represents the data for a security incident.
type Incident struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
	Status      string `json:"status"`
	// This would need to be populated in a real scenario
	SourceIP    string `json:"source_ip,omitempty"`
}

func main() {
	log.Println("Starting nexdefend-soar service...")

	// --- Kafka Consumer ---
	kafkaBroker := os.Getenv("KAFKA_BROKER")
	if kafkaBroker == "" {
		kafkaBroker = "kafka:9092"
	}

	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaBroker,
		"group.id":          "nexdefend-soar",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatalf("Failed to create Kafka consumer: %v", err)
	}
	defer consumer.Close()

	topic := "incidents"
	err = consumer.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		log.Fatalf("Failed to subscribe to topic %s: %v", topic, err)
	}

	log.Println("SOAR service started. Waiting for incident events...")

	for {
		msg, err := consumer.ReadMessage(-1)
		if err == nil {
			var incident Incident
			err := json.Unmarshal(msg.Value, &incident)
			if err != nil {
				log.Printf("Failed to unmarshal incident: %v", err)
				continue
			}

			// --- SOAR Playbook ---
			if incident.Severity == "High" || incident.Severity == "Critical" {
				log.Printf("High-severity incident #%d received. Triggering playbook.", incident.ID)
				triggerScanPlaybook(incident)
			}

		} else {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}

// triggerScanPlaybook is a simple SOAR playbook that scans the source IP of an incident.
func triggerScanPlaybook(incident Incident) {
	if incident.SourceIP == "" {
		log.Println("No source IP in incident, cannot run scan playbook.")
		return
	}

	aiServiceURL := os.Getenv("AI_SERVICE_URL")
	if aiServiceURL == "" {
		aiServiceURL = "http://ai:5000"
	}
	scanURL := aiServiceURL + "/scan"

	aiServiceToken := os.Getenv("AI_SERVICE_TOKEN")
	if aiServiceToken == "" {
		aiServiceToken = "default_secret_token"
	}

	scanRequest := map[string]string{"target": incident.SourceIP}
	jsonBody, err := json.Marshal(scanRequest)
	if err != nil {
		log.Printf("Failed to marshal scan request: %v", err)
		return
	}

	req, err := http.NewRequest("POST", scanURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("Failed to create scan request: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+aiServiceToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send scan request: %v", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		log.Printf("Successfully triggered scan for IP %s", incident.SourceIP)
	} else {
		log.Printf("Failed to trigger scan for IP %s. Status: %d", incident.SourceIP, resp.StatusCode)
	}
}
