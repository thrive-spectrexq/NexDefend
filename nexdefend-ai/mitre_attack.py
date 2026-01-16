
# In-memory mapping of alert signatures to MITRE ATT&CK techniques
MITRE_ATTACK_MAP = {
    "ET TROJAN Likely Bot C&C Detected": ["T1071.001"],
    "ET POLICY PE EXE or DLL Windows file download": ["T1105"],
    "ET SCAN Nmap Scripting Engine User-Agent Detected": ["T1046"],
    "ET EXPLOIT Possible EternalBlue SMB Remote Code Execution": ["T1210"],
    "ET USER_AGENTS Suspicious User Agent": ["T1071"],
    "ET WEB_SERVER Possible SQL Injection": ["T1190"],
    "ET WEB_SERVER Possible XSS": ["T1190"],
    "ET DOS Denial of Service": ["T1498"],
    "ET INFO Sensitive Data Exposure": ["T1005"],
}

KEYWORD_MAP = {
    "C&C": "T1071",
    "Command and Control": "T1071",
    "Botnet": "T1583",
    "Scan": "T1046",
    "Brute Force": "T1110",
    "Ransomware": "T1486",
    "Phishing": "T1566",
    "Exploit": "T1210",
    "Shell": "T1059",
    "PowerShell": "T1059.001",
    "Persistence": "T1547",
    "Privilege Escalation": "T1068",
    "Credential Dumping": "T1003",
    # --- NEW KEYWORDS ---
    "Miner": "T1496",       # Resource Hijacking
    "Crypto": "T1496",      # Resource Hijacking
    "XMRig": "T1496",       # Common Miner Software
    "Wallet": "T1496",      # Resource Hijacking
    "Stratum": "T1071.001", # Mining Protocol
    # --------------------
}

def get_mitre_technique(signature):
    """Looks up the MITRE ATT&CK technique for a given signature."""
    if signature in MITRE_ATTACK_MAP:
        return MITRE_ATTACK_MAP[signature]

    # Fuzzy match / Keyword fallback
    return fuzzy_match_technique(signature)

def fuzzy_match_technique(signature):
    """
    Attempts to map a signature to a MITRE technique using keywords.
    """
    signature_lower = signature.lower()
    matches = []

    for keyword, technique in KEYWORD_MAP.items():
        if keyword.lower() in signature_lower:
            matches.append(technique)

    if matches:
        # Return unique matches
        return list(set(matches))

    return None
