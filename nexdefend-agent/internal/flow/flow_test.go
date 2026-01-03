package flow

import (
	"testing"
	"time"

	"github.com/google/gopacket/layers"
)

func TestFlowMetrics(t *testing.T) {
	// Simple test to ensure Flow struct works as a map key
	flows := make(map[Flow]FlowMetrics)

	f1 := Flow{
		SrcIP:    "192.168.1.1",
		DstIP:    "8.8.8.8",
		SrcPort:  12345,
		DstPort:  53,
		Protocol: layers.IPProtocolUDP,
	}

	f2 := Flow{
		SrcIP:    "192.168.1.1",
		DstIP:    "8.8.8.8",
		SrcPort:  12345,
		DstPort:  53,
		Protocol: layers.IPProtocolUDP,
	}

	f3 := Flow{
		SrcIP:    "10.0.0.1",
		DstIP:    "8.8.8.8",
		SrcPort:  12345,
		DstPort:  53,
		Protocol: layers.IPProtocolUDP,
	}

	if f1 != f2 {
		t.Error("Flows with same attributes should be equal")
	}

	if f1 == f3 {
		t.Error("Flows with different attributes should not be equal")
	}

	now := time.Now()
	flows[f1] = FlowMetrics{
		PacketCount:  1,
		ByteCount:    100,
		StartTimestamp: now,
		EndTimestamp:   now,
	}

	if _, ok := flows[f2]; !ok {
		t.Error("Should be able to retrieve metric using identical flow key")
	}

	flows[f2] = FlowMetrics{
		PacketCount:  2,
		ByteCount:    200,
		StartTimestamp: now,
		EndTimestamp:   now.Add(time.Second),
	}

	if flows[f1].PacketCount != 2 {
		t.Error("Map update failed")
	}
}
