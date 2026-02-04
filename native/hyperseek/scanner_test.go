package hyperseek

import (
	"strings"
	"testing"
)

func TestScanner(t *testing.T) {
	scanner := NewScanner()
	defer scanner.Free()

	// Test case 1: Benign payload (Low Entropy)
	score, _, entropy := scanner.Scan("hello world")
	if score != 0.0 {
		t.Errorf("Expected score 0.0 for benign payload, got %f", score)
	}
	if entropy > 1.0 {
		t.Errorf("Expected low entropy for simple string, got %f", entropy)
	}

	// Test case 2: Malicious payload (eval)
	payload := "some code with eval(foo)"
	score, matches, _ := scanner.Scan(payload)
	if score <= 0.0 {
		t.Errorf("Expected positive score for eval payload, got %f", score)
	}
	if matches == "" {
		t.Errorf("Expected matches to be non-empty for eval payload")
	}

	// Test case 3: High Entropy (Random Data)
	// Create a random-like string
	highEntropyPayload := "897321490zaslkdjf0923u4" // Short but mixed
	_, _, entropy = scanner.Scan(highEntropyPayload)
	if entropy < 2.0 {
		t.Logf("Entropy for mixed string: %f (Expected > 2.0)", entropy)
	}

	// Test case 4: Magic Bytes (ELF)
	// \x7F ELF
	elfPayload := "\x7FELF\x01\x01\x01\x00"
	score, matches, _ = scanner.Scan(elfPayload)
	if !strings.Contains(matches, "FILE_TYPE_ELF") {
		t.Errorf("Expected ELF detection, got matches: %s", matches)
	}
	if score < 50.0 {
		t.Errorf("Expected high score for ELF header, got %f", score)
	}
}
