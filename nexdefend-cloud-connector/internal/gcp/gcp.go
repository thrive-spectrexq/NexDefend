
package gcp

import (
	"context"
	"fmt"
	"time"

	"cloud.google.com/go/pubsub"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// StartGCPIntegration initializes the GCP integration, fetching logs from Pub/Sub and sending them to Kafka.
func StartGCPIntegration(producer *kafka.Producer, topic string, projectID string, subscriptionID string) {
	fmt.Println("Starting GCP integration...")

	go func() {
		for {
			ctx := context.Background()
			client, err := pubsub.NewClient(ctx, projectID)
			if err != nil {
				fmt.Printf("Failed to create GCP Pub/Sub client: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}

			defer client.Close()

			sub := client.Subscription(subscriptionID)
			err = sub.Receive(ctx, func(ctx context.Context, msg *pubsub.Message) {
				logMessage := `{"source": "gcp", "log": "` + string(msg.Data) + `"}`
				err := producer.Produce(&kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          []byte(logMessage),
				}, nil)

				if err != nil {
					fmt.Printf("Failed to produce message to Kafka: %v\n", err)
				}
				msg.Ack()
			})

			if err != nil {
				fmt.Printf("Failed to receive messages from GCP Pub/Sub: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}
		}
	}()

	fmt.Println("GCP integration running.")
}
