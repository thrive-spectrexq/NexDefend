package flow

import (
	"time"

	"github.com/google/gopacket/layers"
)

// Flow represents the 5-tuple that uniquely identifies a network flow.
type Flow struct {
	SrcIP    string
	DstIP    string
	SrcPort  layers.TCPPort
	DstPort  layers.TCPPort
	Protocol layers.IPProtocol
}

// FlowMetrics holds the metrics for a given network flow.
type FlowMetrics struct {
	PacketCount  uint64
	ByteCount    uint64
	StartTimestamp time.Time
	EndTimestamp   time.Time
}
