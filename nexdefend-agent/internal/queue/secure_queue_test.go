package queue

import (
	"crypto/rand"
	"os"
	"testing"
)

func TestSecureQueue(t *testing.T) {
	dirPath := "./test_queue"
	defer os.RemoveAll(dirPath)

	encryptionKey := make([]byte, 32)
	_, err := rand.Read(encryptionKey)
	if err != nil {
		t.Fatalf("Failed to generate encryption key: %v", err)
	}

	q, err := NewSecureQueue(dirPath, encryptionKey)
	if err != nil {
		t.Fatalf("Failed to create secure queue: %v", err)
	}

	// Test Enqueue
	testData := []byte("hello, world")
	if err := q.Enqueue(testData); err != nil {
		t.Fatalf("Failed to enqueue data: %v", err)
	}

	// Test Dequeue
	dequeuedData, err := q.Dequeue()
	if err != nil {
		t.Fatalf("Failed to dequeue data: %v", err)
	}

	if string(dequeuedData) != string(testData) {
		t.Errorf("Dequeued data does not match original data. Got %s, want %s", string(dequeuedData), string(testData))
	}

	// Test Dequeue from empty queue
	dequeuedData, err = q.Dequeue()
	if err != nil {
		t.Fatalf("Failed to dequeue from empty queue: %v", err)
	}
	if dequeuedData != nil {
		t.Errorf("Dequeued data from empty queue should be nil. Got %s", string(dequeuedData))
	}
}
