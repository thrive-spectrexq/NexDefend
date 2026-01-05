package aws

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
)

type AWSCollector struct {
	Client *ec2.Client
}

type CloudAsset struct {
	InstanceID   string `json:"instance_id"`
	Name         string `json:"name"`
	Type         string `json:"type"`
	State        string `json:"state"`
	PublicIP     string `json:"public_ip"`
	PrivateIP    string `json:"private_ip"`
	Region       string `json:"region"`
}

// NewAWSCollector initializes the AWS client
func NewAWSCollector(region string) (*AWSCollector, error) {
	// Load config from ~/.aws/config or environment variables (AWS_ACCESS_KEY_ID, etc.)
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %v", err)
	}

	return &AWSCollector{
		Client: ec2.NewFromConfig(cfg),
	}, nil
}

// FetchAssets retrieves running EC2 instances
func (c *AWSCollector) FetchAssets() ([]CloudAsset, error) {
	log.Println("Fetching AWS Assets...")

	var assets []CloudAsset
	input := &ec2.DescribeInstancesInput{}

	paginator := ec2.NewDescribeInstancesPaginator(c.Client, input)

	for paginator.HasMorePages() {
		page, err := paginator.NextPage(context.TODO())
		if err != nil {
			return nil, fmt.Errorf("failed to describe instances: %v", err)
		}

		for _, reservation := range page.Reservations {
			for _, instance := range reservation.Instances {
				// Only track running instances
				if instance.State.Name != types.InstanceStateNameRunning {
					continue
				}

				name := "Unknown"
				for _, tag := range instance.Tags {
					if *tag.Key == "Name" {
						name = *tag.Value
						break
					}
				}

				asset := CloudAsset{
					InstanceID: *instance.InstanceId,
					Name:       name,
					Type:       string(instance.InstanceType),
					State:      string(instance.State.Name),
					PrivateIP:  aws.ToString(instance.PrivateIpAddress),
					PublicIP:   aws.ToString(instance.PublicIpAddress),
				}

				assets = append(assets, asset)
			}
		}
	}

	log.Printf("Found %d active AWS assets", len(assets))
	return assets, nil
}
