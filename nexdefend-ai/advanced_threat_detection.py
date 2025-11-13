
import re

def analyze_command_line(command_line):
    """Analyzes a command line for suspicious patterns."""
    suspicious_patterns = [
        r"powershell.*-enc.*",  # Encoded PowerShell command
        r"wget.*-O.*\/tmp\/",  # Downloading a file to /tmp
        r"curl.*-o.*\/tmp\/",  # Downloading a file to /tmp
        r"nc.*-e.*\/bin\/bash",  # Netcat reverse shell
    ]

    for pattern in suspicious_patterns:
        if re.search(pattern, command_line, re.IGNORECASE):
            return True

    return False
