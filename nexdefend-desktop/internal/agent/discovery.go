package agent

import (
	"fmt"
	"net"
	"sync"
	"time"
)

type DiscoveredHost struct {
	IP       string `json:"ip"`
	Status   string `json:"status"`
	Hostname string `json:"hostname,omitempty"`
}

// DiscoverLocalNetwork scans the local subnet for active hosts
// Note: Requires appropriate OS permissions for ping/dial
func DiscoverLocalNetwork() ([]DiscoveredHost, error) {
	// 1. Determine Local Subnet
	ip, _, err := getLocalIP()
	if err != nil {
		return nil, err
	}

	var hosts []DiscoveredHost
	var wg sync.WaitGroup
	var mutex sync.Mutex

	// 2. Generate IPs to scan (Simple /24 scan)
	// Iterate through 1..254
	baseIP := ip.To4()

	// Limit to scanning 20 neighbors for demo speed/safety
	// In production, full subnet scan logic is needed
	for i := 1; i <= 20; i++ {
		targetIP := net.IPv4(baseIP[0], baseIP[1], baseIP[2], byte(i)).String()
		if targetIP == ip.String() { continue }

		wg.Add(1)
		go func(target string) {
			defer wg.Done()
			if isReachable(target) {
				// Try to resolve hostname
				names, _ := net.LookupAddr(target)
				hostname := ""
				if len(names) > 0 { hostname = names[0] }

				mutex.Lock()
				hosts = append(hosts, DiscoveredHost{
					IP:       target,
					Status:   "Active",
					Hostname: hostname,
				})
				mutex.Unlock()
			}
		}(targetIP)
	}

	wg.Wait()
	return hosts, nil
}

// Simple TCP connect scan on port 80/443/22 to check reachability
// (ICMP often blocked or requires root)
func isReachable(ip string) bool {
	timeout := 500 * time.Millisecond
	ports := []string{"80", "443", "22", "135"} // Common ports

	for _, port := range ports {
		conn, err := net.DialTimeout("tcp", net.JoinHostPort(ip, port), timeout)
		if err == nil {
			conn.Close()
			return true
		}
	}
	return false
}

func getLocalIP() (net.IP, *net.IPNet, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return nil, nil, err
	}
	for _, address := range addrs {
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP, ipnet, nil
			}
		}
	}
	return nil, nil, fmt.Errorf("no ip found")
}
