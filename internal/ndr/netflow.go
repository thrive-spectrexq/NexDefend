
package ndr

import (
	"fmt"
	"log"
	"net"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// NetFlowCollector defines the interface for a NetFlow collector.
type NetFlowCollector interface {
	StartCollector() error
}

// UDPNetFlowCollector implements NetFlowCollector using a UDP listener
type UDPNetFlowCollector struct {
	Port      int
	EventChan chan<- models.CommonEvent
}

func NewNetFlowCollector(port int, eventChan chan<- models.CommonEvent) *UDPNetFlowCollector {
	return &UDPNetFlowCollector{Port: port, EventChan: eventChan}
}

// StartCollector starts the UDP listener for NetFlow packets.
func (c *UDPNetFlowCollector) StartCollector() error {
	addr := fmt.Sprintf(":%d", c.Port)
	udpAddr, err := net.ResolveUDPAddr("udp", addr)
	if err != nil {
		return err
	}

	conn, err := net.ListenUDP("udp", udpAddr)
	if err != nil {
		return err
	}

	log.Printf("Starting NetFlow collector on UDP port %d...", c.Port)

	go func() {
		defer conn.Close()
		buf := make([]byte, 8192)
		for {
			n, remoteAddr, err := conn.ReadFromUDP(buf)
			if err != nil {
				log.Printf("Error reading NetFlow packet: %v", err)
				continue
			}

			// Basic NetFlow v5 Header Check (First 2 bytes = version)
			if n > 2 {
				version := uint16(buf[0])<<8 | uint16(buf[1])
				if version == 5 || version == 9 || version == 10 {
					// Create a metric event for volume tracking
					event := models.CommonEvent{
						Timestamp: time.Now(),
						EventType: "netflow_packet",
						RawEvent: map[string]interface{}{
							"version": version,
							"size":    n,
							"source":  remoteAddr.String(),
						},
					}

					select {
					case c.EventChan <- event:
					default:
						// Drop if channel full
					}
				}
			}
		}
	}()

	return nil
}
