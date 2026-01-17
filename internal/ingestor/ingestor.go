package ingestor

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/opensearch-project/opensearch-go/v2/opensearchapi"
	"github.com/thrive-spectrexq/NexDefend/internal/correlation"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
	"github.com/thrive-spectrexq/NexDefend/internal/normalizer"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// ProcessEvent handles a single normalized event: Correlation + Indexing
func ProcessEvent(normalizedEvent *models.CommonEvent, correlationEngine correlation.CorrelationEngine, osClient *opensearch.Client, db *gorm.DB) {
	// Handle specific event types for DB persistence (Assets, K8s, Cloud)
	if normalizedEvent.EventType == "cloud_asset" {
		saveCloudAsset(normalizedEvent, db)
	} else if normalizedEvent.EventType == "kubernetes_pod" {
		saveKubernetesPod(normalizedEvent, db)
	}

	// Send the event to the correlation engine
	incident, err := correlationEngine.Correlate(*normalizedEvent)
	if err != nil {
		log.Printf("Failed to correlate event: %v", err)
	}

	if incident != nil {
		log.Printf("Incident created: %v", incident)
		if result := db.Create(incident); result.Error != nil {
			log.Printf("Failed to save incident to DB: %v", result.Error)
		}
	}

	eventJSON, err := json.Marshal(normalizedEvent)
	if err != nil {
		log.Printf("Failed to marshal normalized event to JSON: %v", err)
		return
	}

	// Index the event into OpenSearch/ZincSearch
	indexReq := opensearchapi.IndexRequest{
		Index: "events",
		Body:  strings.NewReader(string(eventJSON)),
	}

	// Use background context as this is fire-and-forget from worker's perspective
	res, err := indexReq.Do(context.Background(), osClient)
	if err != nil {
		log.Printf("Error getting response from Search Engine: %s", err)
		return
	}
	defer res.Body.Close()

	if res.IsError() {
		// ZincSearch sometimes returns 200 OK even on partial failures, but if it returns an error code, log it
		// log.Printf("Error indexing document: %s", res.String())
	}
}

func saveCloudAsset(event *models.CommonEvent, db *gorm.DB) {
	dataBytes, _ := json.Marshal(event.Data)
	var asset models.CloudAsset
	if err := json.Unmarshal(dataBytes, &asset); err != nil {
		log.Printf("Failed to parse cloud asset data: %v", err)
		return
	}
	asset.DetectedAt = time.Now()

	// Upsert based on InstanceID
	if err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "instance_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"state", "name", "public_ip", "detected_at"}),
	}).Create(&asset).Error; err != nil {
		log.Printf("Failed to upsert cloud asset: %v", err)
	}
}

func saveKubernetesPod(event *models.CommonEvent, db *gorm.DB) {
	dataBytes, _ := json.Marshal(event.Data)
	var pod models.KubernetesPod
	if err := json.Unmarshal(dataBytes, &pod); err != nil {
		log.Printf("Failed to parse k8s pod data: %v", err)
		return
	}
	pod.UpdatedAt = time.Now()

	// Upsert based on Name + Namespace
	if err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "name"}, {Name: "namespace"}},
		DoUpdates: clause.AssignmentColumns([]string{"phase", "node_name", "pod_ip", "updated_at"}),
	}).Create(&pod).Error; err != nil {
		log.Printf("Failed to upsert k8s pod: %v", err)
	}
}

// StartIngestor initializes and starts the ingestor service.
func StartIngestor(correlationEngine correlation.CorrelationEngine, internalEvents <-chan models.CommonEvent, db *gorm.DB) {
	log.Println("Initializing ingestor service...")

	// --- OpenSearch/Zinc Client ---
	opensearchAddr := os.Getenv("OPENSEARCH_ADDR")
	if opensearchAddr == "" {
		opensearchAddr = "http://opensearch:9200"
	}

	osClient, err := opensearch.NewClient(opensearch.Config{
		Addresses: []string{opensearchAddr},
	})
	if err != nil {
		log.Printf("Warning: Failed to create Search client: %v", err)
	}

	// Worker Pool Setup
	numWorkers := 3
	jobQueue := make(chan *models.CommonEvent, 1000)
	var wg sync.WaitGroup

	// Start Workers
	for i := 0; i < numWorkers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for event := range jobQueue {
				ProcessEvent(event, correlationEngine, osClient, db)
			}
		}(i)
	}

	// 1. Internal Channel Listener (Always Active - for API/Agents)
	go func() {
		if internalEvents == nil { return }
		for event := range internalEvents {
			evt := event
			jobQueue <- &evt
		}
	}()

	// 2. Kafka Consumer (Enterprise Mode Only)
	kafkaBroker := os.Getenv("KAFKA_BROKER")
	if kafkaBroker != "" {
		log.Printf("--- ENTERPRISE MODE: Starting Kafka Consumer at %s ---", kafkaBroker)
		go func() {
			consumer, err := kafka.NewConsumer(&kafka.ConfigMap{
				"bootstrap.servers": kafkaBroker,
				"group.id":          "nexdefend-api",
				"auto.offset.reset": "earliest",
			})
			if err != nil {
				log.Printf("Failed to create Kafka consumer: %v", err)
				return
			}
			defer consumer.Close()
			
			topic := "nexdefend-events"
			err = consumer.SubscribeTopics([]string{topic}, nil)
			if err != nil {
				log.Printf("Failed to subscribe to topic %s: %v", topic, err)
				return
			}

			log.Println("Kafka Ingestor started. Waiting for messages...")

			for {
				msg, err := consumer.ReadMessage(-1)
				if err == nil {
					normalizedEvent, err := normalizer.NormalizeEvent(msg.Value)
					if err != nil {
						log.Printf("Failed to normalize event: %v", err)
						continue
					}
					jobQueue <- normalizedEvent

				} else {
					log.Printf("Consumer error: %v (%v)\n", err, msg)
					time.Sleep(1 * time.Second)
				}
			}
		}()
	} else {
		log.Println("--- DEMO MODE: Kafka Consumer Disabled (Using Internal Channels) ---")
	}

	select {} // Keep running
}
