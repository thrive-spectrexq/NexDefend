package firewall

import (
	"fmt"
	"log"
	"os"
	"os/exec"
)

type FirewallManager struct {
	DemoMode bool
}

func NewFirewallManager() *FirewallManager {
	return &FirewallManager{
		DemoMode: os.Getenv("DEMO_MODE") == "true",
	}
}

// BlockIP blocks an IP address using the system firewall (iptables)
func (f *FirewallManager) BlockIP(ip string) error {
	if f.DemoMode {
		log.Printf("[SOAR-SIMULATION] 🛡️ Firewall Rule Applied: DROP traffic from %s", ip)
		return nil
	}

	// Real Execution (Linux iptables)
	// Requires root privileges (CAP_NET_ADMIN)
	log.Printf("[SOAR-REAL] Executing: iptables -A INPUT -s %s -j DROP", ip)

	cmd := exec.Command("iptables", "-A", "INPUT", "-s", ip, "-j", "DROP")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to block IP %s: %v | Output: %s", ip, err, string(output))
	}

	return nil
}

// UnblockIP removes the block rule
func (f *FirewallManager) UnblockIP(ip string) error {
	if f.DemoMode {
		log.Printf("[SOAR-SIMULATION] 🛡️ Firewall Rule Removed: ALLOW traffic from %s", ip)
		return nil
	}

	cmd := exec.Command("iptables", "-D", "INPUT", "-s", ip, "-j", "DROP")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to unblock IP %s: %v | Output: %s", ip, err, string(output))
	}

	return nil
}
