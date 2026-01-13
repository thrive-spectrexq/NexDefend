
//go:build linux
// +build linux

package main

import (
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func init() {
	startPlatformSpecificModules = func(getProducer ProducerProvider, eventsTopic string, config *AgentConfig) {
		go startFIMWatcher(getProducer, eventsTopic, config)
		go startNetWatcher(getProducer, eventsTopic)
	}
}
