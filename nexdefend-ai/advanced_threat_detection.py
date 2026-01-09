
import re

def analyze_command_line(command_line):
    """Analyzes a command line for suspicious patterns."""
    suspicious_patterns = [
        r"powershell.*-enc.*",  # Encoded PowerShell command
        r"powershell.*-nop.*-w hidden", # Hidden window powershell
        r"wget.*-O.*\/tmp\/",  # Downloading a file to /tmp
        r"curl.*-o.*\/tmp\/",  # Downloading a file to /tmp
        r"nc.*-e.*\/bin\/bash",  # Netcat reverse shell
        r"bash -i >& /dev/tcp/", # Bash reverse shell
        r"python -c .*socket.*", # Python reverse shell
        r"perl -e .*socket.*",   # Perl reverse shell
        r"socat exec:.*tcp:.*",  # Socat reverse shell
        r"whoami",               # Reconnaissance (context dependent, but suspicious in isolation usually)
        r"id",                   # Reconnaissance
        r"cat /etc/shadow",      # Credential dumping
        r"mimikatz",             # Credential dumping
    ]

    for pattern in suspicious_patterns:
        if re.search(pattern, command_line, re.IGNORECASE):
            return True

    return False

def analyze_process_tree(process_list):
    """
    Analyzes a list of processes for suspicious parent-child relationships.

    Args:
        process_list (list): List of dicts with 'name', 'pid', 'ppid'.

    Returns:
        list: List of anomalies found (strings).
    """
    anomalies = []

    # Map pid to process info for easy lookup
    process_map = {p['pid']: p for p in process_list}

    suspicious_parents = {
        'powershell.exe': ['winword.exe', 'excel.exe', 'outlook.exe', 'chrome.exe'],
        'cmd.exe': ['winword.exe', 'excel.exe', 'outlook.exe', 'chrome.exe'],
        'wscript.exe': ['winword.exe', 'excel.exe', 'outlook.exe'],
        'cscript.exe': ['winword.exe', 'excel.exe', 'outlook.exe'],
        'svchost.exe': ['explorer.exe'] # svchost should usually be spawned by services.exe
    }

    for p in process_list:
        name = p.get('name', '').lower()
        ppid = p.get('ppid')

        if ppid in process_map:
            parent_name = process_map[ppid].get('name', '').lower()

            # Check suspicious parent
            if name in suspicious_parents:
                if parent_name in suspicious_parents[name]:
                    anomalies.append(f"Suspicious Child Process: {name} spawned by {parent_name} (PID: {p['pid']}, PPID: {ppid})")

    return anomalies
