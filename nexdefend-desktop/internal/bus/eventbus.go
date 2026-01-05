package bus

import (
	"sync"
)

// EventType defines the topic of the message
type EventType string

const (
	EventSecurityAlert EventType = "alert"
	EventNetFlow       EventType = "flow"
	EventLog           EventType = "log"
	EventSystemStats   EventType = "stats"
)

// EventBus is a thread-safe pub/sub system
type EventBus struct {
	subscribers map[EventType][]chan interface{}
	lock        sync.RWMutex
}

var globalBus *EventBus
var once sync.Once

// GetBus returns the singleton instance of the EventBus
func GetBus() *EventBus {
	once.Do(func() {
		globalBus = &EventBus{
			subscribers: make(map[EventType][]chan interface{}),
		}
	})
	return globalBus
}

// Publish sends data to all subscribers of a topic
func (b *EventBus) Publish(topic EventType, data interface{}) {
	b.lock.RLock()
	defer b.lock.RUnlock()

	if chans, found := b.subscribers[topic]; found {
		for _, ch := range chans {
			// Non-blocking send to prevent freezing if a consumer is slow
			select {
			case ch <- data:
			default:
				// Channel full, drop message or handle overflow
			}
		}
	}
}

// Subscribe returns a channel that receives messages for a topic
func (b *EventBus) Subscribe(topic EventType) <-chan interface{} {
	b.lock.Lock()
	defer b.lock.Unlock()

	ch := make(chan interface{}, 100) // Buffer size of 100
	b.subscribers[topic] = append(b.subscribers[topic], ch)
	return ch
}
