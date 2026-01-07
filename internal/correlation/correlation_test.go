package correlation

import (
	"testing"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

func TestCorrelationEngine(t *testing.T) {
	engine := NewCorrelationEngine()

	// Test case 1: No match
	normalEvent := models.CommonEvent{
		EventType: "auth",
		RawEvent:  "user=alice status=success",
		Timestamp: time.Now(),
	}
	incident, err := engine.Correlate(normalEvent)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}
	if incident != nil {
		t.Errorf("Expected nil incident for normal event, got %v", incident)
	}

	// Test case 2: Match Root Login Failure
	attackEvent := models.CommonEvent{
		EventType: "auth",
		RawEvent:  "user=root status=failed",
		Timestamp: time.Now(),
	}
	incident, err = engine.Correlate(attackEvent)
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}
	if incident == nil {
		t.Errorf("Expected incident for attack event, got nil")
	} else {
		if incident.Severity != "High" {
			t.Errorf("Expected High severity, got %s", incident.Severity)
		}
	}
}
