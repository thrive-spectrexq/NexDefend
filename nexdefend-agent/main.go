package main

import (
	"encoding/json"
	"log"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/fsnotify/fsnotify"
	"github.com/shirou/gopsutil/net"
	"github.com/shirou/gopsutil/process"
)

// Event is a generic wrapper for different types of security events.
type Event struct {
	EventType string      `json:"event_type"`
	Timestamp time.Time   `json:"timestamp"`
	Data      interface{} `json:"data"`
}

// ProcessEvent represents the data collected for a single process.
type ProcessEvent struct {
	PID     int32  `json:"pid"`
	Name    string `json:"name"`
	Cmdline string `json:"cmdline"`
}

// FIMEvent represents a file integrity monitoring event.
type FIMEvent struct {
	Path      string `json:"path"`
	Operation string `json:"operation"`
}

// NetConnectionEvent represents a new network connection.
type NetConnectionEvent struct {
	PID    int32  `json:"pid"`
	Local  string `json:"local_address"`
	Remote string `json:"remote_address"`
	Status string `json:"status"`
}

var (
	// Keep track of seen connections to only report new ones.
	seenConnections = make(map[string]struct{})
)

func main() {
	log.Println("Starting nexdefend-agent...")

	// --- Kafka Producer ---
	kafkaBroker := os.Getenv("KAFKA_BROKER")
	if kafkaBroker == "" {
		kafkaBroker = "kafka:9092"
	}
	topic := "nexdefend-events"

	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBroker})
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	defer producer.Close()

	// Go-routine to handle delivery reports
	go func() {
		for e := range producer.Events() {
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					log.Printf("Delivery failed: %v\n", ev.TopicPartition)
				}
			}
		}
	}()

	// --- FIM Watcher ---
	go startFIMWatcher(producer, topic)
	// --- Network Connection Monitoring ---
	go startNetWatcher(producer, topic)

	// --- Process Monitoring Loop ---
	for {
		processes, err := process.Processes()
		if err != nil {
			log.Printf("Failed to get processes: %v", err)
			time.Sleep(10 * time.Second)
			continue
		}

		for _, p := range processes {
			name, err := p.Name()
			if err != nil {
				continue
			}
			cmdline, err := p.Cmdline()
			if err != nil {
				cmdline = ""
			}

			procEvent := ProcessEvent{
				PID:     p.Pid,
				Name:    name,
				Cmdline: cmdline,
			}

			event := Event{
				EventType: "process",
				Timestamp: time.Now(),
				Data:      procEvent,
			}

			eventJSON, err := json.Marshal(event)
			if err != nil {
				log.Printf("Failed to marshal process event to JSON: %v", err)
				continue
			}

			producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          eventJSON,
			}, nil)
		}

		producer.Flush(15 * 1000)
		time.Sleep(10 * time.Second)
	}
}

// startFIMWatcher initializes and runs the file integrity monitoring watcher.
func startFIMWatcher(producer *kafka.Producer, topic string) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Failed to create FIM watcher: %v", err)
	}
	defer watcher.Close()

	go func() {
		for {
			select {
			case event, ok := <-watcher.Events:
				if !ok {
					return
				}

				fimEvent := FIMEvent{
					Path:      event.Name,
					Operation: event.Op.String(),
				}

				wrappedEvent := Event{
					EventType: "fim",
					Timestamp: time.Now(),
					Data:      fimEvent,
				}

				eventJSON, err := json.Marshal(wrappedEvent)
				if err != nil {
					log.Printf("Failed to marshal FIM event to JSON: %v", err)
					continue
				}

				producer.Produce(&kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          eventJSON,
				}, nil)

			case err, ok := <-watcher.Errors:
				if !ok {
					return
				}
				log.Println("FIM watcher error:", err)
			}
		}
	}()

	fimPath := os.Getenv("FIM_PATH")
	if fimPath == "" {
		fimPath = "/etc" // Default to /etc
		log.Println("INFO: FIM_PATH not set, monitoring default directory '/etc'")
	}
	err = watcher.Add(fimPath)
	if err != nil {
		log.Fatalf("Failed to add path to FIM watcher: %v", err)
	}
	log.Printf("FIM watcher started on path: %s", fimPath)

	// Block forever to keep the watcher alive
	<-make(chan struct{})
}

// startNetWatcher periodically polls for new network connections.
func startNetWatcher(producer *kafka.Producer, topic string) {
	for {
		connections, err := net.Connections("all")
		if err != nil {
			log.Printf("Failed to get network connections: %v", err)
			time.Sleep(15 * time.Second)
			continue
		}

		for _, conn := range connections {
			connID := conn.Laddr.IP + ":" + string(conn.Laddr.Port) + "->" + conn.Raddr.IP + ":" + string(conn.Raddr.Port)
			if _, exists := seenConnections[connID]; !exists {
				seenConnections[connID] = struct{}{}

				netEvent := NetConnectionEvent{
					PID:    conn.Pid,
					Local:  conn.Laddr.IP + ":" + string(conn.Laddr.Port),
					Remote: conn.Raddr.IP + ":" + string(conn.Raddr.Port),
					Status: conn.Status,
				}

				wrappedEvent := Event{
					EventType: "net_connection",
					Timestamp: time.Now(),
					Data:      netEvent,
				}

				eventJSON, err := json.Marshal(wrappedEvent)
				if err != nil {
					log.Printf("Failed to marshal network event to JSON: %v", err)
					continue
				}

				producer.Produce(&kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
					Value:          eventJSON,
				}, nil)
			}
		}
		time.Sleep(15 * time.Second)
	}
}
