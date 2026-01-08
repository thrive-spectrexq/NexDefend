package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"nexdefend-desktop/internal/config"
)

func TestApp_GetSystemInfo(t *testing.T) {
	app := NewApp()
	info := app.GetSystemInfo()

	assert.NotEmpty(t, info["hostname"])
	assert.Equal(t, "Secure", info["status"])
	assert.Equal(t, "Embedded/Offline", info["mode"])
}

func TestApp_AskSentinel_NoServer(t *testing.T) {
	app := NewApp()
	// Mock store for config
	tmpDir := t.TempDir()
	store, _ := config.NewStore(tmpDir)
	app.configStore = store

	// Should fail gracefully if Ollama is not running
	response := app.AskSentinel("Hello")
	assert.Contains(t, response, "Error: Could not connect to Local AI")
}

func TestApp_AskSentinel_MockServer(t *testing.T) {
	// 1. Mock Ollama Server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		assert.Equal(t, "/api/generate", r.URL.Path)

		body, _ := io.ReadAll(r.Body)
		var req ChatRequest
		json.Unmarshal(body, &req)

		assert.Contains(t, req.Prompt, "Test Prompt")

		// Respond
		resp := ChatResponse{Response: "I am ready."}
		json.NewEncoder(w).Encode(resp)
	}))
	defer server.Close()

	// 2. Setup App with Mock URL
	app := NewApp()
	tmpDir := t.TempDir()

	// Create a temporary config file pointing to our mock server
	cfgPath := filepath.Join(tmpDir, "nexdefend-config.json")
	cfg := config.AppConfig{
		OllamaURL: server.URL + "/api/generate",
	}
	data, _ := json.Marshal(cfg)
	os.WriteFile(cfgPath, data, 0644)

	store, _ := config.NewStore(tmpDir)
	app.configStore = store

	// 3. Test
	response := app.AskSentinel("Test Prompt")
	assert.Equal(t, "I am ready.", response)
}

func TestApp_ConfigFlow(t *testing.T) {
	app := NewApp()
	tmpDir := t.TempDir()
	store, _ := config.NewStore(tmpDir)
	app.configStore = store

	// Initial default check
	settings := app.GetSettings()
	assert.Equal(t, "dark", settings.Theme)

	// Update settings
	newSettings := config.AppConfig{
		Theme:     "light",
		OllamaURL: "http://test:1234",
	}
	result := app.SaveSettings(newSettings)
	assert.Equal(t, "Settings Saved", result)

	// Verify persistence
	loadedSettings := app.GetSettings()
	assert.Equal(t, "light", loadedSettings.Theme)
	assert.Equal(t, "http://test:1234", loadedSettings.OllamaURL)
}
