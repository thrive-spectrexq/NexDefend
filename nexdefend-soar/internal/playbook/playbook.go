
package playbook

import (
	"log"
	"nexdefend/nexdefend-soar/internal/remediation"
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
	Actions []Action `json:"actions"`
}

// Execute runs the actions in a playbook.
func (p *Playbook) Execute() {
	log.Printf("Executing playbook: %s", p.Name)

	for _, action := range p.Actions {
		switch action.Type {
		case "scan":
			remediation.Scan(action.Params["target"])
		case "isolate":
			remediation.Isolate(action.Params["target"])
		case "block":
			remediation.Block(action.Params["target"])
		default:
			log.Printf("Unknown action type: %s", action.Type)
		}
	}
}
