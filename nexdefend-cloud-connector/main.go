
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
	"nexdefend/nexdefend-cloud-connector/internal/saas"
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
	azure.StartAzureIntegration(producer, cfg.KafkaTopic, cfg.AZURE_CONNECTION_STRING, cfg.AZURE_EVENT_HUB_NAME)
	gcp.StartGCPIntegration(producer, cfg.KafkaTopic, cfg.GCP_PROJECT_ID, cfg.GCP_SUBSCRIPTION_ID)
	saas.StartOktaIntegration(producer, cfg.KafkaTopic, cfg.OKTA_DOMAIN, cfg.OKTA_API_KEY)

	fmt.Println("NexDefend Cloud Connector is running.")
	<-sigchan
	fmt.Println("Shutting down NexDefend Cloud Connector.")
}
