
package main

import (
	"encoding/json"
	"log"
	"os"
	"strings"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"nexdefend/nexdefend-soar/internal/playbook"
	"nexdefend/nexdefend-soar/internal/playbook_editor"
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

	// Load playbooks
	playbooks, err := playbook_editor.LoadPlaybooks("playbooks.yml")
	if err != nil {
		log.Fatalf("Failed to load playbooks: %v", err)
	}

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
			for _, pb := range playbooks {
				if (incident.Severity == "High" || incident.Severity == "Critical") && pb.ID == "pb-001" {
					log.Printf("High-severity incident #%d received. Triggering playbook.", incident.ID)
					// Replace placeholders in playbook params
					for i, action := range pb.Actions {
						for k, v := range action.Params {
							pb.Actions[i].Params[k] = strings.Replace(v, "{source_ip}", incident.SourceIP, -1)
						}
					}
					pb.Execute()
				}
			}

		} else {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}
