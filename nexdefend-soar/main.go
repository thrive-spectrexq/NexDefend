
package main

import (
	"encoding/json"
	"log"
	"os"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"nexdefend/nexdefend-soar/internal/playbook"
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

				// Define a simple playbook
				pb := &playbook.Playbook{
					ID:   "pb-001",
					Name: "High-Severity Incident Playbook",
					Actions: []playbook.Action{
						{
							Type: "scan",
							Params: map[string]string{
								"target": incident.SourceIP,
							},
						},
						{
							Type: "isolate",
							Params: map[string]string{
								"target": incident.SourceIP,
							},
						},
					},
				}

				// Execute the playbook
				pb.Execute()
			}

		} else {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}
