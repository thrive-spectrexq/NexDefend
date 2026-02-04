
//go:build linux
// +build linux

package main

import (
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-agent/ebpf"
)

func init() {
	startPlatformSpecificModules = func(getProducer ProducerProvider, eventsTopic string, config *AgentConfig) {
		go startFIMWatcher(getProducer, eventsTopic, config)
		go startNetWatcher(getProducer, eventsTopic)
		go ebpf.LoadAndAttach()
	}
}
