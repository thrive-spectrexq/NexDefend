import nmap


def scan_open_ports(ip_address, port_range="1-1024"):
    try:
        scanner = nmap.PortScanner()
        print(f"Scanning {ip_address} for open ports in range {port_range}...")
        scanner.scan(ip_address, port_range)

        # Check if the IP address was found in the scan results
        if ip_address in scanner.all_hosts():
            open_ports = scanner[ip_address]["tcp"]
            return {
                port: details["state"]
                for port, details in open_ports.items()
                if details["state"] == "open"
            }
        else:
            print(f"No hosts found for {ip_address}.")
            return {}

    except nmap.PortScannerError as e:
        print(f"Port scanning error: {e}")
        return {}
    except Exception as e:
        print(f"An error occurred: {e}")
        return {}
