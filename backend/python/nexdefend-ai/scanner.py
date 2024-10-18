import nmap


def scan_open_ports(ip_address):
    scanner = nmap.PortScanner()
    scanner.scan(ip_address, "1-1024")
    return scanner[ip_address]["tcp"]
