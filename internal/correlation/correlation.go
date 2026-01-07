package correlation

import (
	"fmt"
	"time"
	"strings"
	"github.com/thrive-spectrexq/NexDefend/internal/models"
)

type Incident struct {
	ID          int
	Description string
	Severity    string
	Status      string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type Rule struct {
	ID          string
	Name        string
	Condition   func(models.CommonEvent) bool
	Severity    string
	Description string
}

type CorrelationEngine interface {
	Correlate(event models.CommonEvent) (*models.Incident, error)
}

// SimpleCorrelationEngine implements real logic
type SimpleCorrelationEngine struct {
	Rules []Rule
}

func NewCorrelationEngine() *SimpleCorrelationEngine {
	// Initialize with detection rules
	return &SimpleCorrelationEngine{
		Rules: []Rule{
			{
				ID:   "RULE-001",
				Name: "Root Login Attempt",
				Condition: func(e models.CommonEvent) bool {
					// Check for auth events involving root that failed
					return e.EventType == "auth" && strings.Contains(fmt.Sprintf("%v", e.RawEvent), "user=root") && strings.Contains(fmt.Sprintf("%v", e.RawEvent), "failed")
				},
				Severity:    "High",
				Description: "Multiple failed login attempts detected for root user.",
			},
			{
				ID:   "RULE-002",
				Name: "Shadow File Modification",
				Condition: func(e models.CommonEvent) bool {
					// Check FIM events for critical files
					return e.EventType == "fim" && (strings.Contains(fmt.Sprintf("%v", e.RawEvent), "/etc/shadow") || strings.Contains(fmt.Sprintf("%v", e.RawEvent), "/etc/passwd"))
				},
				Severity:    "Critical",
				Description: "Critical system authentication file modified.",
			},
		},
	}
}

// Correlate evaluates the event against all active rules
func (c *SimpleCorrelationEngine) Correlate(event models.CommonEvent) (*models.Incident, error) {
	for _, rule := range c.Rules {
		if rule.Condition(event) {
			return &models.Incident{
				Description: fmt.Sprintf("%s - %s", rule.Name, rule.Description),
				Severity:    rule.Severity,
				Status:      "Open",
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}, nil
		}
	}
	return nil, nil
}
