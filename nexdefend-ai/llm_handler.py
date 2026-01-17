import requests
import json
import os
import logging

# Configuration
# Defaults to localhost for local dev, or 'host.docker.internal' if running in Docker
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral")

class LLMHandler:
    def __init__(self):
        self.generate_url = f"{OLLAMA_HOST}/api/generate"
        logging.info(f"LLM Handler initialized. Target: {self.generate_url} Model: {OLLAMA_MODEL}")

    def generate_response(self, user_query, context_data=None):
        """
        Sends a prompt to Ollama and returns the generated text.
        """
        # 1. System Prompt (The Persona)
        system_prompt = (
            "You are Sentinel, an elite cybersecurity AI analyst for the NexDefend platform. "
            "Your goal is to explain security events, analyze logs, and suggest remediation steps. "
            "Be concise, professional, and actionable. Do not hallucinate facts."
        )

        # 2. Build Context
        full_prompt = f"{system_prompt}\n\n"

        if context_data:
            # truncate context if too large to avoid token limits
            context_str = json.dumps(context_data, indent=2, default=str)
            if len(context_str) > 2000:
                context_str = context_str[:2000] + "...(truncated)"
            full_prompt += f"SYSTEM CONTEXT:\n{context_str}\n\n"

        full_prompt += f"USER QUERY: {user_query}\n\nSENTINEL:"

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
