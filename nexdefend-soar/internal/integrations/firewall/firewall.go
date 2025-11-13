
package firewall

import "log"

// Firewall defines the interface for a firewall.
type Firewall interface {
	BlockIP(ip string) error
}

// MockFirewall is a mock implementation of the Firewall interface.
type MockFirewall struct{}

// BlockIP blocks an IP address on the firewall.
func (f *MockFirewall) BlockIP(ip string) error {
	log.Printf("Blocking IP address %s on the firewall", ip)
	return nil
}
