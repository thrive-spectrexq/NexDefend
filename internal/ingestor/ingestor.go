
package ingestor

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strings"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
	"github.com/thrive-spectrexq/NexDefend/internal/normalizer"
)

// StartIngestor initializes and starts the ingestor service.
func StartIngestor() {
	log.Println("Initializing ingestor service...")

	// --- Kafka Consumer ---
	kafkaBroker := os.Getenv("KAFKA_BROKER")
	if kafkaBroker == "" {
		kafkaBroker = "kafka:9092"
	}

	consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers": kafkaBroker,
		"group.id":          "nexdefend-api",
		"auto.offset.reset": "earliest",
	})
	if err != nil {
		log.Fatalf("Failed to create Kafka consumer: %v", err)
	}
	defer consumer.Close()

	// --- OpenSearch Client ---
	opensearchAddr := os.Getenv("OPENSEARCH_ADDR")
	if opensearchAddr == "" {
		opensearchAddr = "http://opensearch:9200"
	}

	osClient, err := opensearch.NewClient(opensearch.Config{
		Addresses: []string{opensearchAddr},
	})
	if err != nil {
		log.Fatalf("Failed to create OpenSearch client: %v", err)
	}

	// --- Consume Loop ---
	topic := "nexdefend-events"
	err = consumer.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		log.Fatalf("Failed to subscribe to topic %s: %v", topic, err)
	}

	log.Println("Ingestor service started. Waiting for messages...")

	for {
		msg, err := consumer.ReadMessage(-1)
		if err == nil {
			normalizedEvent, err := normalizer.NormalizeEvent(msg.Value)
			if err != nil {
				log.Printf("Failed to normalize event: %v", err)
				continue
			}

			eventJSON, err := json.Marshal(normalizedEvent)
			if err != nil {
				log.Printf("Failed to marshal normalized event to JSON: %v", err)
				continue
			}

			// Index the event into OpenSearch
			indexReq := opensearchapi.IndexRequest{
				Index: "events",
				Body:  strings.NewReader(string(eventJSON)),
			}

			res, err := indexReq.Do(context.Background(), osClient)
			if err != nil {
				log.Printf("Error getting response from OpenSearch: %s", err)
				continue
			}
			defer res.Body.Close()

			if res.IsError() {
				log.Printf("Error indexing document: %s", res.String())
			}

		} else {
			// The client will automatically try to recover from all errors.
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}
