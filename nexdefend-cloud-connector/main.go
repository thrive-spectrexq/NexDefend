
package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/confluentinc/confluent-kafka-go/kafka"

	"nexdefend/nexdefend-cloud-connector/internal/aws"
	"nexdefend/nexdefend-cloud-connector/internal/azure"
	"nexdefend/nexdefend-cloud-connector/internal/config"
	"nexdefend/nexdefend-cloud-connector/internal/gcp"
)

func main() {
	fmt.Println("Starting NexDefend Cloud Connector...")

	// Load configuration
	cfg := config.LoadConfig()

	// Kafka producer configuration
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": "kafka:9092"})
	if err != nil {
		panic(err)
	}
	defer producer.Close()

	// Handle graceful shutdown
	sigchan := make(chan os.Signal, 1)
	signal.Notify(sigchan, syscall.SIGINT, syscall.SIGTERM)

	// Start integrations
	aws.StartAWSIntegration(producer, cfg.KafkaTopic)
	azure.StartAzureIntegration(producer, cfg.KafkaTopic)
	gcp.StartGCPIntegration(producer, cfg.KafkaTopic)

	fmt.Println("NexDefend Cloud Connector is running.")
	<-sigchan
	fmt.Println("Shutting down NexDefend Cloud Connector.")
}
