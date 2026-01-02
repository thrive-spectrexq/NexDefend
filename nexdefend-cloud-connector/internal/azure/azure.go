
package azure

import (
	"context"
	"fmt"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/messaging/azeventhubs"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// StartAzureIntegration initializes the Azure integration, fetching logs from Event Hubs and sending them to Kafka.
func StartAzureIntegration(producer *kafka.Producer, topic string, connectionString string, eventHubName string) {
	fmt.Println("Starting Azure integration...")

	go func() {
		for {
			consumer, err := azeventhubs.NewConsumerClientFromConnectionString(connectionString, eventHubName, azeventhubs.DefaultConsumerGroup, nil)
			if err != nil {
				fmt.Printf("Failed to create Azure Event Hubs consumer: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}

			defer consumer.Close(context.Background())

			// Get partition IDs
			ehProps, err := consumer.GetEventHubProperties(context.Background(), nil)
			if err != nil {
				fmt.Printf("Failed to get Azure Event Hub properties: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}

			for _, partitionID := range ehProps.PartitionIDs {
				go func(pid string) {
					partitionClient, err := consumer.NewPartitionClient(pid, nil)
					if err != nil {
						fmt.Printf("Failed to create partition client for %s: %v\n", pid, err)
						return
					}
					defer partitionClient.Close(context.Background())

					for {
						events, err := partitionClient.ReceiveEvents(context.Background(), 10, nil)
						if err != nil {
							fmt.Printf("Failed to receive events from partition %s: %v\n", pid, err)
							time.Sleep(5 * time.Second)
							continue
						}

						for _, event := range events {
							logMessage := `{"source": "azure", "log": "` + string(event.Body) + `"}`
							err := producer.Produce(&kafka.Message{
								TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
								Value:          []byte(logMessage),
							}, nil)

							if err != nil {
								fmt.Printf("Failed to produce message to Kafka: %v\n", err)
							}
						}
					}
				}(partitionID)
			}

			// Block main loop to keep consumer open
			select {}
		}
	}()

	fmt.Println("Azure integration running.")
}
