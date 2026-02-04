import requests
import json
import os
import logging
import re

# Configuration
# Defaults to localhost for local dev, or 'host.docker.internal' if running in Docker
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

def redact_pii(text):
    """
    Redacts personally identifiable information (PII) from the text.
    Handles IPv4, Email, Credit Card (basic), and SSN (basic).
    """
    if not isinstance(text, str):
        return text

    # Regex patterns
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    # Basic Credit Card (Visa, MasterCard, Amex, Discover) - groupings of 4 or similar
    cc_pattern = r'\b(?:\d{4}[- ]?){3}\d{4}\b'
    # SSN (US)
    ssn_pattern = r'\b\d{3}-\d{2}-\d{4}\b'

    redacted = re.sub(ip_pattern, '[REDACTED_IP]', text)
    redacted = re.sub(email_pattern, '[REDACTED_EMAIL]', redacted)
    redacted = re.sub(cc_pattern, '[REDACTED_CC]', redacted)
    redacted = re.sub(ssn_pattern, '[REDACTED_SSN]', redacted)

    return redacted

class LLMHandler:
    def __init__(self):
        self.generate_url = f"{OLLAMA_HOST}/api/generate"
        logging.info(f"LLM Handler initialized. Target: {self.generate_url} Model: {OLLAMA_MODEL}")

    def generate_response(self, user_query, context_data=None):
        """
        Sends a prompt to Ollama and returns the generated text.
        """
        # Redact PII from user query
        safe_query = redact_pii(user_query)

        # 1. System Prompt (The Persona)
        system_prompt = (
            "You are NexDefend AI, an elite cybersecurity AI analyst for the NexDefend platform. "
            "Your goal is to explain security events, analyze logs, and suggest remediation steps. "
            "Be concise, professional, and actionable. Do not hallucinate facts."
        )

        # 2. Build Context
        full_prompt = f"{system_prompt}\n\n"

        if context_data:
            # Redact PII from context data before serialization
            # We do a naive redaction by dumping to string first
            context_str = json.dumps(context_data, indent=2, default=str)
            safe_context_str = redact_pii(context_str)

            # truncate context if too large to avoid token limits
            if len(safe_context_str) > 2000:
                safe_context_str = safe_context_str[:2000] + "...(truncated)"
            full_prompt += f"SYSTEM CONTEXT:\n{safe_context_str}\n\n"

        full_prompt += f"USER QUERY: {safe_query}\n\nNEXDEFEND AI:"

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": full_prompt,
            "stream": False
        }

        try:
            response = requests.post(self.generate_url, json=payload, timeout=45)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "Error: Empty response from AI model.")

        except requests.exceptions.ConnectionError:
            return f"Error: Could not connect to Ollama at {OLLAMA_HOST}. Is the service running?"
        except Exception as e:
            logging.error(f"LLM Generation Error: {e}")
            return "Error: An unexpected error occurred while processing your query."

# Singleton instance
llm_agent = LLMHandler()
