
//go:build windows
// +build windows

package main

import (
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-agent/internal/winevent"
)

func init() {
	startPlatformSpecificModules = func(getProducer ProducerProvider, eventsTopic string, config *AgentConfig) {
		go winevent.StartWinEventLogWatcher(getProducer, eventsTopic)
	}
}
