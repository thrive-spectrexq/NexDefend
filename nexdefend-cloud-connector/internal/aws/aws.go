
package aws

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// StartAWSIntegration initializes the AWS integration, fetching logs from S3 and sending them to Kafka.
func StartAWSIntegration(producer *kafka.Producer, topic string, bucketName string, region string) {
	fmt.Printf("Starting AWS integration for bucket: %s (Region: %s)...\n", bucketName, region)

	processedKeys := make(map[string]bool)

	go func() {
		for {
			// Load the Shared AWS Configuration (~/.aws/config)
			cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
			if err != nil {
				fmt.Printf("Failed to load AWS config: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}

			// Create an Amazon S3 service client
			client := s3.NewFromConfig(cfg)

			if bucketName == "" {
				fmt.Println("AWS S3 Bucket name not configured. Skipping AWS integration.")
				return
			}

			// Get the first page of results for ListObjectsV2 for a bucket
			output, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
				Bucket: &bucketName,
			})
			if err != nil {
				fmt.Printf("Failed to list objects in bucket %s: %v\n", bucketName, err)
				time.Sleep(10 * time.Second)
				continue
			}

			for _, object := range output.Contents {
				key := *object.Key
				if processedKeys[key] {
					continue
				}

				fmt.Printf("Processing new key: %s\n", key)

				// In a real implementation, we would fetch the object content and produce to Kafka
				// For now, we just mark it as processed
				processedKeys[key] = true

				// produce message to kafka
				producer.Produce(&kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          []byte(fmt.Sprintf("New S3 object detected: %s", key)),
				}, nil)
			}

			time.Sleep(60 * time.Second) // Poll for new logs every 60 seconds
		}
	}()

	fmt.Println("AWS integration running.")
}
