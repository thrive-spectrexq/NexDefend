
# In-memory mapping of alert signatures to MITRE ATT&CK techniques
MITRE_ATTACK_MAP = {
    "ET TROJAN Likely Bot C&C Detected": ["T1071.001"],
    "ET POLICY PE EXE or DLL Windows file download": ["T1105"],
    "ET SCAN Nmap Scripting Engine User-Agent Detected": ["T1046"],
    # ... add more mappings as needed
}

def get_mitre_technique(signature):
    """Looks up the MITRE ATT&CK technique for a given signature."""
    return MITRE_ATTACK_MAP.get(signature)
