package remediation

import (
	"fmt"
	"log"

	"github.com/thrive-spectrexq/NexDefend/nexdefend-soar/internal/integrations/firewall"
)

type ActionExecutor struct {
	fw *firewall.FirewallManager
}

func NewActionExecutor() *ActionExecutor {
	return &ActionExecutor{
		fw: firewall.NewFirewallManager(),
	}
}

// ExecuteAction runs a specific remediation step
func (e *ActionExecutor) ExecuteAction(actionType string, target string) error {
	log.Printf("Executing Action: %s on Target: %s", actionType, target)

	switch actionType {
	case "block_ip":
		return e.fw.BlockIP(target)

	case "isolate_host":
		// Example: Could move host to a quarantine VLAN or shutdown interface
		log.Printf("[SOAR] Isolating host %s (Simulation)", target)
		return nil

	case "disable_user":
		log.Printf("[SOAR] Disabling user %s (Simulation)", target)
		return nil

	case "email_alert":
		log.Printf("[SOAR] Sending email alert to admin regarding %s", target)
		return nil

	default:
		return fmt.Errorf("unknown action type: %s", actionType)
	}
}
