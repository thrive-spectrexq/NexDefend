
//go:build linux
// +build linux

package main

import (
	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

func init() {
	startPlatformSpecificModules = func(producer *kafka.Producer, eventsTopic string, config *AgentConfig) {
		go startFIMWatcher(producer, eventsTopic, config)
		go startNetWatcher(producer, eventsTopic)
	}
}
