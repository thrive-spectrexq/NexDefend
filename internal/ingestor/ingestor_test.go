
package ingestor

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/opensearch-project/opensearch-go/v2"
	"github.com/stretchr/testify/assert"
	"github.com/thrive-spectrexq/NexDefend/internal/correlation"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

// mockRoundTripper is used to mock HTTP requests for the OpenSearch client.
type mockRoundTripper struct {
	roundTrip func(req *http.Request) (*http.Response, error)
}

func (m *mockRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	return m.roundTrip(req)
}

// mockKafkaConsumer is a mock implementation of a Kafka consumer.
type mockKafkaConsumer struct {
	messageChan chan *kafka.Message
	errorChan   chan error
	subscribed  bool
	closed      bool
	mutex       sync.Mutex
}

func newMockKafkaConsumer() *mockKafkaConsumer {
	return &mockKafkaConsumer{
		messageChan: make(chan *kafka.Message, 1),
		errorChan:   make(chan error, 1),
	}
}

func (m *mockKafkaConsumer) ReadMessage(timeout time.Duration) (*kafka.Message, error) {
	select {
	case msg := <-m.messageChan:
		return msg, nil
	case err := <-m.errorChan:
		return nil, err
	case <-time.After(timeout):
		return nil, kafka.NewError(kafka.ErrTimedOut, "timed out", false)
	}
}

func (m *mockKafkaConsumer) SubscribeTopics(topics []string, rebalanceCb kafka.RebalanceCb) error {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	if len(topics) == 0 {
		return errors.New("no topics provided")
	}
	m.subscribed = true
	return nil
}

func (m *mockKafkaConsumer) Close() error {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	if !m.closed {
		m.closed = true
		close(m.messageChan)
		close(m.errorChan)
	}
	return nil
}

func TestStartIngestor(t *testing.T) {
	// --- Test Setup ---
	var capturedBody []byte
	var wg sync.WaitGroup
	wg.Add(1) // We expect one document to be indexed

	// Mock OpenSearch client
	mockTransport := &mockRoundTripper{
		roundTrip: func(req *http.Request) (*http.Response, error) {
			defer wg.Done()
			var err error
			capturedBody, err = io.ReadAll(req.Body)
			assert.NoError(t, err)

			return &http.Response{
				StatusCode: http.StatusOK,
				Body:       io.NopCloser(strings.NewReader(`{"result":"created"}`)),
				Header:     http.Header{"X-Opensearch-Version": []string{"2.0.0"}},
			}, nil
		},
	}
	osClient, err := opensearch.NewClient(opensearch.Config{
		Transport: mockTransport,
	})
	assert.NoError(t, err)

	// Mock Kafka Consumer
	mockConsumer := newMockKafkaConsumer()

	// Mock Correlation Engine
	mockCorrelationEngine := &correlation.MockCorrelationEngine{}

	// --- Run the ingestor in a goroutine ---
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go func() {
		ingestorLoop(ctx, mockConsumer, osClient, mockCorrelationEngine)
	}()

	// --- Simulate a Kafka message ---
	testEvent := models.Event{
		Timestamp: time.Now().UTC(),
		EventType: "TestProcessEvent",
		Data:      map[string]interface{}{"process_name": "test.exe", "pid": 1234},
	}
	rawEvent, err := json.Marshal(testEvent)
	assert.NoError(t, err)

	mockConsumer.messageChan <- &kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: new(string), Partition: 0},
		Value:          rawEvent,
	}

	// --- Assertions ---
	// Wait for the OpenSearch mock to be called
	if waitTimeout(&wg, 2*time.Second) {
		t.Fatal("timed out waiting for document to be indexed")
	}

	// Stop the ingestor loop
	cancel()

	// Verify the captured data
	assert.NotEmpty(t, capturedBody)
	var capturedEvent models.CommonEvent
	err = json.Unmarshal(capturedBody, &capturedEvent)
	assert.NoError(t, err)

	// Timestamps can be tricky, so we'll assert that they're close.
	assert.WithinDuration(t, testEvent.Timestamp, capturedEvent.Timestamp, time.Second)
	assert.Equal(t, testEvent.EventType, capturedEvent.EventType)
	assert.Equal(t, testEvent.Data.(map[string]interface{})["process_name"], capturedEvent.RawEvent.(map[string]interface{})["process_name"])
}

// waitTimeout waits for the waitgroup for the specified duration.
// Returns true if timed out, false otherwise.
func waitTimeout(wg *sync.WaitGroup, timeout time.Duration) bool {
	c := make(chan struct{})
	go func() {
		defer close(c)
		wg.Wait()
	}()
	select {
	case <-c:
		return false // completed normally
	case <-time.After(timeout):
		return true // timed out
	}
}
