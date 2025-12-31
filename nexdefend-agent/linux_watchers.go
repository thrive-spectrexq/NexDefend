
//go:build linux
// +build linux

package main

import (
	"encoding/json"
	"log"
	"strconv"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/fsnotify/fsnotify"
	psnet "github.com/shirou/gopsutil/net"
)

var (
	seenConnections = make(map[string]struct{})
)

func startFIMWatcher(producer *kafka.Producer, topic string, config *AgentConfig) {
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

	for _, path := range config.FIMPaths {
		err = watcher.Add(path)
		if err != nil {
			log.Printf("Failed to add path to FIM watcher: %v", err)
		}
		log.Printf("FIM watcher started on path: %s", path)
	}

	<-make(chan struct{})
}

func startNetWatcher(producer *kafka.Producer, topic string) {
	for {
		connections, err := psnet.Connections("all")
		if err != nil {
			log.Printf("Failed to get network connections: %v", err)
			time.Sleep(15 * time.Second)
			continue
		}

		currentActiveConnections := make(map[string]struct{})

		for _, conn := range connections {
			connID := conn.Laddr.IP + ":" + strconv.Itoa(int(conn.Laddr.Port)) + "->" + conn.Raddr.IP + ":" + strconv.Itoa(int(conn.Raddr.Port))
			currentActiveConnections[connID] = struct{}{}

			if _, exists := seenConnections[connID]; !exists {
				seenConnections[connID] = struct{}{}

				netEvent := NetConnectionEvent{
					PID:    conn.Pid,
					Local:  conn.Laddr.IP + ":" + strconv.Itoa(int(conn.Laddr.Port)),
					Remote: conn.Raddr.IP + ":" + strconv.Itoa(int(conn.Raddr.Port)),
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

		// Cleanup closed connections from seenConnections
		for connID := range seenConnections {
			if _, exists := currentActiveConnections[connID]; !exists {
				delete(seenConnections, connID)
			}
		}

		time.Sleep(15 * time.Second)
	}
}
