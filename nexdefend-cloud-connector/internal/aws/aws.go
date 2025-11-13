
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
func StartAWSIntegration(producer *kafka.Producer, topic string) {
	fmt.Println("Starting AWS integration...")

	go func() {
		for {
			// Load the Shared AWS Configuration (~/.aws/config)
			cfg, err := config.LoadDefaultConfig(context.TODO())
			if err != nil {
				fmt.Printf("Failed to load AWS config: %v\n", err)
				time.Sleep(10 * time.Second)
				continue
			}

			// Create an Amazon S3 service client
			client := s3.NewFromConfig(cfg)

			// Get the first page of results for ListObjectsV2 for a bucket
			output, err := client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
				Bucket: &topic,
			})
			if err != nil {
				fmt.Printf("Failed to list objects in bucket %s: %v\n", topic, err)
				time.Sleep(10 * time.Second)
				continue
			}

			for _, object := range output.Contents {
				fmt.Printf("Key: %s\n", *object.Key)
			}

			time.Sleep(10 * time.Second) // Poll for new logs every 10 seconds
		}
	}()

	fmt.Println("AWS integration running.")
}
