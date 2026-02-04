import unittest
from llm_handler import redact_pii

class TestLLMHandler(unittest.TestCase):
    def test_redact_pii(self):
        text = "Contact me at user@example.com or 192.168.1.1."
        redacted = redact_pii(text)
        self.assertIn("[REDACTED_EMAIL]", redacted)
        self.assertIn("[REDACTED_IP]", redacted)
        self.assertNotIn("user@example.com", redacted)
        self.assertNotIn("192.168.1.1", redacted)

    def test_redact_ssn(self):
        text = "My SSN is 123-45-6789."
        redacted = redact_pii(text)
        self.assertIn("[REDACTED_SSN]", redacted)
        self.assertNotIn("123-45-6789", redacted)

if __name__ == '__main__':
    unittest.main()
