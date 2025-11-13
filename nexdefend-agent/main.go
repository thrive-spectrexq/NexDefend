
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/google/gopacket"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/process"

	"github.com/thrive-spectrexq/NexDefend/nexdefend-agent/internal/flow"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-agent/internal/kubernetes"
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

type Asset struct {
	Hostname      string `json:"hostname"`
	IPAddress     string `json:"ip_address"`
	OSVersion     string `json:"os_version"`
	MACAddress    string `json:"mac_address"`
	AgentVersion  string `json:"agent_version"`
}

type AgentConfig struct {
	FIMPaths             []string `json:"fim_paths"`
	CollectionIntervalSec int      `json:"collection_interval_sec"`
}

var (
	startPlatformSpecificModules func(producer *kafka.Producer, eventsTopic string, config *AgentConfig)
	EventsSent                   = promauto.NewCounterVec(prometheus.CounterOpts{
		Name: "nexdefend_agent_events_sent_total",
		Help: "Total number of events sent by the agent.",
	}, []string{"type"})
)

func main() {
	log.Println("Starting nexdefend-agent...")

	// Expose the a /metrics endpoint for Prometheus
	http.Handle("/metrics", promhttp.Handler())
	go func() {
		log.Fatal(http.ListenAndServe(":8082", nil))
	}()

	config := getAgentConfig()

	kafkaBroker := os.Getenv("KAFKA_BROKER")
	if kafkaBroker == "" {
		kafkaBroker = "kafka:9092"
	}
	eventsTopic := "nexdefend-events"
	flowsTopic := "nexdefend-flows"

	producer, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBroker})
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	defer producer.Close()

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

	startPlatformSpecificModules(producer, eventsTopic, config)
	go startHeartbeat()
	go startFlowMonitor(producer, flowsTopic)

	if os.Getenv("KUBERNETES_SERVICE_HOST") != "" {
		go kubernetes.StartKubernetesWatcher(producer, eventsTopic)
	}

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
				TopicPartition: kafka.TopicPartition{Topic: &eventsTopic, Partition: kafka.PartitionAny},
				Value:          eventJSON,
			}, nil)
			EventsSent.WithLabelValues("process").Inc()
		}

		producer.Flush(15 * 1000)
		time.Sleep(time.Duration(config.CollectionIntervalSec) * time.Second)
	}
}

func startHeartbeat() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		hostInfo, err := host.Info()
		if err != nil {
			log.Printf("Failed to get host info: %v", err)
			continue
		}

		interfaces, err := net.Interfaces()
		if err != nil {
			log.Printf("Failed to get network interfaces: %v", err)
			continue
		}

		var ipAddress, macAddress string
		for _, i := range interfaces {
			if i.Flags&net.FlagUp != 0 && i.Flags&net.FlagLoopback == 0 {
				addrs, err := i.Addrs()
				if err != nil {
					continue
				}
				for _, addr := range addrs {
					if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
						if ipnet.IP.To4() != nil {
							ipAddress = ipnet.IP.String()
							break
						}
					}
				}
				macAddress = i.HardwareAddr.String()
				break
			}
		}

		asset := Asset{
			Hostname:      hostInfo.Hostname,
			IPAddress:     ipAddress,
			OSVersion:     hostInfo.OS,
			MACAddress:    macAddress,
			AgentVersion:  "1.0.0",
		}

		assetJSON, err := json.Marshal(asset)
		if err != nil {
			log.Printf("Failed to marshal asset to JSON: %v", err)
			continue
		}

		resp, err := http.Post("http://api:8080/api/v1/assets/heartbeat", "application/json", bytes.NewBuffer(assetJSON))
		if err != nil {
			log.Printf("Failed to send heartbeat: %v", err)
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("Failed to send heartbeat, status code: %d", resp.StatusCode)
		}
	}
}

func getAgentConfig() *AgentConfig {
	hostname, err := os.Hostname()
	if err != nil {
		log.Fatalf("Failed to get hostname: %v", err)
	}

	resp, err := http.Get(fmt.Sprintf("http://api:8080/api/v1/agent/config/%s", hostname))
	if err != nil {
		log.Printf("Failed to get agent config: %v", err)
		return &AgentConfig{
			FIMPaths:             []string{"/etc"},
			CollectionIntervalSec: 10,
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("Failed to get agent config, status code: %d", resp.StatusCode)
		return &AgentConfig{
			FIMPaths:             []string{"/etc"},
			CollectionIntervalSec: 10,
		}
	}

	var config AgentConfig
	if err := json.NewDecoder(resp.Body).Decode(&config); err != nil {
		log.Printf("Failed to decode agent config: %v", err)
		return &AgentConfig{
			FIMPaths:             []string{"/etc"},
			CollectionIntervalSec: 10,
		}
	}

	return &config
}

func startFlowMonitor(producer *kafka.Producer, topic string) {
	handle, err := pcap.OpenLive("eth0", 1600, true, pcap.BlockForever)
	if err != nil {
		log.Fatalf("Failed to open pcap handle: %v", err)
	}
	defer handle.Close()

	packetSource := gopacket.NewPacketSource(handle, handle.LinkType())
	flows := make(map[flow.Flow]flow.FlowMetrics)

	ticker := time.NewTicker(60 * time.Second)
	defer ticker.Stop()

	go func() {
		for range ticker.C {
			for key, metrics := range flows {
				if time.Since(metrics.EndTimestamp) > 30*time.Second {
					event := Event{
						EventType: "flow",
						Timestamp: metrics.EndTimestamp,
						Data: map[string]interface{}{
							"flow":    key,
							"metrics": metrics,
						},
					}

					eventJSON, err := json.Marshal(event)
					if err != nil {
						log.Printf("Failed to marshal flow event to JSON: %v", err)
						continue
					}

					producer.Produce(&kafka.Message{
						TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
						Value:          eventJSON,
					}, nil)
					EventsSent.WithLabelValues("flow").Inc()

					delete(flows, key)
				}
			}
		}
	}()

	for packet := range packetSource.Packets() {
		ipLayer := packet.Layer(layers.LayerTypeIPv4)
		if ipLayer == nil {
			continue
		}
		ip, _ := ipLayer.(*layers.IPv4)

		tcpLayer := packet.Layer(layers.LayerTypeTCP)
		if tcpLayer == nil {
			continue
		}
		tcp, _ := tcpLayer.(*layers.TCP)

		flowKey := flow.Flow{
			SrcIP:    ip.SrcIP.String(),
			DstIP:    ip.DstIP.String(),
			SrcPort:  tcp.SrcPort,
			DstPort:  tcp.DstPort,
			Protocol: ip.Protocol,
		}

		metrics := flows[flowKey]
		metrics.PacketCount++
		metrics.ByteCount += uint64(len(packet.Data()))
		metrics.EndTimestamp = time.Now()
		if metrics.StartTimestamp.IsZero() {
			metrics.StartTimestamp = time.Now()
		}

		flows[flowKey] = metrics
	}
}
