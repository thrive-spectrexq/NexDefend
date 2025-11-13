
import re

def is_dga(domain):
    """Detects if a domain is a DGA domain."""
    # This is a very simple DGA detection algorithm. In a real implementation,
    # you would use a more sophisticated algorithm, such as a machine learning model.
    if len(domain) > 20:
        return True
    if re.search(r"\d", domain):
        return True
    return False
