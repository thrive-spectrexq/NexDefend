
package main

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/alert"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/playbook"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/playbook_editor"
	"gopkg.in/yaml.v2"
)

// Incident represents the data for a security incident.
type Incident struct {
	ID          int    `json:"id"`
	Description string `json:"description"`
	Severity    string `json:"severity"`
	Status      string `json:"status"`
	// This would need to be populated in a real scenario
	SourceIP string `json:"source_ip,omitempty"`
	PID      string `json:"pid,omitempty"`
}

var (
	PlaybooksRun = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "nexdefend_soar_playbooks_run_total",
		Help: "Total number of SOAR playbooks run.",
	}, []string{"playbook", "status"})
)

// PlaybookManager handles dynamic access and updates to playbooks
type PlaybookManager struct {
	playbooks []playbook.Playbook
	mutex     sync.RWMutex
	filePath  string
}

func NewPlaybookManager(filePath string) (*PlaybookManager, error) {
	pbs, err := playbook_editor.LoadPlaybooks(filePath)
	if err != nil {
		return nil, err
	}
	return &PlaybookManager{
		playbooks: pbs,
		filePath:  filePath,
	}, nil
}

func (pm *PlaybookManager) GetPlaybooks() []playbook.Playbook {
	pm.mutex.RLock()
	defer pm.mutex.RUnlock()
	// Return a copy to avoid race conditions if the caller modifies the slice elements (shallow copy of slice is enough if we don't modify elements)
	// But let's be safe.
	return pm.playbooks
}

func (pm *PlaybookManager) UpdatePlaybooks(newPlaybooks []playbook.Playbook) error {
	pm.mutex.Lock()
	defer pm.mutex.Unlock()

	// Serialize to YAML
	data, err := yaml.Marshal(&newPlaybooks)
	if err != nil {
		return err
	}

	// Write to file
	if err := ioutil.WriteFile(pm.filePath, data, 0644); err != nil {
		return err
	}

	// Update memory
	pm.playbooks = newPlaybooks
	return nil
}

func main() {
	log.Println("Starting nexdefend-soar service...")

	// Initialize Playbook Manager
	pm, err := NewPlaybookManager("playbooks.yml")
	if err != nil {
		log.Fatalf("Failed to initialize Playbook Manager: %v", err)
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
	http.HandleFunc("/api/v1/alerts", alert.WebhookHandler(pm.GetPlaybooks(), producer)) // Note: alert webhook might need to be updated to use PM if it caches playbooks

	// Playbook API Endpoints
	http.HandleFunc("/api/v1/playbooks", func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		if r.Method == "GET" {
			pbs := pm.GetPlaybooks()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(pbs)
			return
		}

		if r.Method == "POST" {
			var newPlaybooks []playbook.Playbook
			if err := json.NewDecoder(r.Body).Decode(&newPlaybooks); err != nil {
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}

			if err := pm.UpdatePlaybooks(newPlaybooks); err != nil {
				http.Error(w, "Failed to save playbooks", http.StatusInternalServerError)
				log.Printf("Error saving playbooks: %v", err)
				return
			}

			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "success"})
			return
		}

		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

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
			// Get current playbooks from manager
			currentPlaybooks := pm.GetPlaybooks()

			for _, pb := range currentPlaybooks {
				if (incident.Severity == "High" || incident.Severity == "Critical") && (pb.ID == "pb-001" || pb.ID == "pb-003") {
					log.Printf("High-severity incident #%d received. Triggering playbook.", incident.ID)
					// Clone playbook actions to avoid modifying the template in memory
					// (Since Params map is a reference type, we need deep copy if we modify it)
					actionsCopy := make([]playbook.Action, len(pb.Actions))
					for i, a := range pb.Actions {
						paramsCopy := make(map[string]string)
						for k, v := range a.Params {
							paramsCopy[k] = v
						}
						actionsCopy[i] = playbook.Action{Type: a.Type, Params: paramsCopy}
					}

					// Replace placeholders in playbook params
					for i, action := range actionsCopy {
						for k, v := range action.Params {
							updatedVal := strings.Replace(v, "{source_ip}", incident.SourceIP, -1)
							updatedVal = strings.Replace(updatedVal, "{pid}", incident.PID, -1)
							actionsCopy[i].Params[k] = updatedVal
						}
					}

					// Create a temporary playbook instance with resolved params to execute
					tempPB := pb
					tempPB.Actions = actionsCopy

					err := tempPB.Execute(producer)
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
