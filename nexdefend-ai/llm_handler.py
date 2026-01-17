import requests
import json
import os

# Configuration
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://host.docker.internal:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "mistral") # or llama3

class LLMHandler:
    def __init__(self):
        self.base_url = f"{OLLAMA_HOST}/api/generate"
        print(f"LLM Handler initialized. Connecting to {OLLAMA_HOST} using {OLLAMA_MODEL}")

    def generate_response(self, user_query, context_data=None):
        """
        Sends a prompt to Ollama and returns the response.
        :param user_query: The user's question (e.g., "Analyze this IP")
        :param context_data: Optional JSON data (logs, alerts) to give the AI context.
        """

        # 1. Construct the Expert System Prompt
        system_prompt = """You are Sentinel, an elite cybersecurity AI analyst for the NexDefend platform.
Your goal is to explain complex security events clearly, suggest remediation steps, and analyze raw logs.
Be concise, professional, and actionable. If you don't know, say so."""

        # 2. Build the final prompt
        full_prompt = f"{system_prompt}\n\n"

        if context_data:
            full_prompt += f"CONTEXT DATA:\n{json.dumps(context_data, indent=2)}\n\n"

        full_prompt += f"USER QUERY: {user_query}\n\nRESPONSE:"

        payload = {
            "model": OLLAMA_MODEL,
            "prompt": full_prompt,
            "stream": False
        }

        try:
            # 3. Call Ollama API
            response = requests.post(self.base_url, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "Error: No response from model.")

        except requests.exceptions.ConnectionError:
            return "Error: Could not connect to Ollama. Is it running on port 11434?"
        except Exception as e:
            return f"Error querying AI: {str(e)}"

# Singleton instance
llm_agent = LLMHandler()
