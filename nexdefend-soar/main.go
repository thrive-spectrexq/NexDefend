
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/alert"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/playbook_editor"
)

// Incident represents the data for a security incident.
type Incident struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
	Status      string `json:"status"`
	// This would need to be populated in a real scenario
	SourceIP    string `json:"source_ip,omitempty"`
	PID         string `json:"pid,omitempty"`
}

var (
	PlaybooksRun = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "nexdefend_soar_playbooks_run_total",
		Help: "Total number of SOAR playbooks run.",
	}, []string{"playbook", "status"})
)

func main() {
	log.Println("Starting nexdefend-soar service...")

	// Load playbooks
	playbooks, err := playbook_editor.LoadPlaybooks("playbooks.yml")
	if err != nil {
		log.Fatalf("Failed to load playbooks: %v", err)
	}

	// --- Kafka ---
	kafkaBroker := os.Getenv("KAFKA_BROKER")
	if kafkaBroker == "" {
		kafkaBroker = "kafka:9092"
	}

	// Producer
	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBroker})
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	defer producer.Close()

	// Expose the a /metrics endpoint for Prometheus
	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/api/v1/alerts", alert.WebhookHandler(playbooks, producer))
	go func() {
		log.Fatal(http.ListenAndServe(":8080", nil))
	}()

	// Consumer
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
			for _, pb := range playbooks {
				if (incident.Severity == "High" || incident.Severity == "Critical") && (pb.ID == "pb-001" || pb.ID == "pb-003") {
					log.Printf("High-severity incident #%d received. Triggering playbook.", incident.ID)
					// Replace placeholders in playbook params
					for i, action := range pb.Actions {
						for k, v := range action.Params {
							updatedVal := strings.Replace(v, "{source_ip}", incident.SourceIP, -1)
							updatedVal = strings.Replace(updatedVal, "{pid}", incident.PID, -1)
							pb.Actions[i].Params[k] = updatedVal
						}
					}
					err := pb.Execute(producer)
					if err != nil {
						PlaybooksRun.WithLabelValues(pb.ID, "failed").Inc()
					} else {
						PlaybooksRun.WithLabelValues(pb.ID, "success").Inc()
					}
				}
			}

		} else {
			log.Printf("Consumer error: %v (%v)\n", err, msg)
		}
	}
}
