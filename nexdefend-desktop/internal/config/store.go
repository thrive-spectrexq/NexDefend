package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// AppConfig holds user preferences
type AppConfig struct {
	VirusTotalKey string `json:"virustotal_key"`
	OllamaURL     string `json:"ollama_url"`
	Theme         string `json:"theme"`
	RefreshRate   int    `json:"refresh_rate"` // in seconds
	AutoBlock     bool   `json:"auto_block"`   // Auto-kill malicious processes
}

type Store struct {
	path  string
	mutex sync.RWMutex
	Data  AppConfig
}

func NewStore(appDataPath string) (*Store, error) {
	configPath := filepath.Join(appDataPath, "nexdefend-config.json")
	store := &Store{
		path: configPath,
		Data: AppConfig{
			OllamaURL:   "http://localhost:11434/api/generate",
			RefreshRate: 2,
			Theme:       "dark",
		},
	}

	// Load existing if available
	store.load()
	return store, nil
}

func (s *Store) load() {
	file, err := os.ReadFile(s.path)
	if err == nil {
		json.Unmarshal(file, &s.Data)
	}
}

func (s *Store) Save(config AppConfig) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	s.Data = config
	data, err := json.MarshalIndent(s.Data, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(s.path, data, 0644)
}

func (s *Store) Get() AppConfig {
	s.mutex.RLock()
	defer s.mutex.RUnlock()
	return s.Data
}
