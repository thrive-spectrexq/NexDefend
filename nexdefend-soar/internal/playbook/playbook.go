
package playbook

import (
	"encoding/json"
	"log"
	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/remediation"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
)

// Action represents a single action to be taken in a playbook.
type Action struct {
	Type   string            `json:"type"`
	Params map[string]string `json:"params"`
}

// Playbook represents a series of actions to be taken in response to an incident.
type Playbook struct {
	ID      string   `json:"id"`
	Name    string   `json:"name"`
	Trigger string   `json:"trigger"`
	Actions []Action `json:"actions"`
}

// Command represents a command sent to an agent.
type Command struct {
	Action     string            `json:"action"`
	Parameters map[string]string `json:"parameters"`
}

// Execute runs the actions in a playbook.
func (p *Playbook) Execute(producer *kafka.Producer) error {
	log.Printf("Executing playbook: %s", p.Name)

	for _, action := range p.Actions {
		switch action.Type {
		case "scan":
			remediation.Scan(action.Params["target"])
		case "isolate":
			remediation.Isolate(action.Params["target"])
		case "block":
			remediation.Block(action.Params["target"])
		case "disable_user":
			remediation.DisableUser(action.Params["username"])
		case "kill_process":
			command := Command{
				Action:     "kill_process",
				Parameters: map[string]string{"pid": action.Params["pid"]},
			}
			cmdJSON, err := json.Marshal(command)
			if err != nil {
				log.Printf("Failed to marshal command to JSON: %v", err)
				return err
			}
			topic := "nexdefend-agent-responses"
			producer.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          cmdJSON,
			}, nil)
		default:
			log.Printf("Unknown action type: %s", action.Type)
		}
	}
	return nil
}
