package ai

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"time"
)

// Model represents an AI model with its path and name.
type Model struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

// Prediction represents the result of a model's threat analysis.
type Prediction struct {
	ThreatLevel string    `json:"threatLevel"` // Low, Medium, High, Critical
	ThreatType  string    `json:"threatType"`  // e.g., Malware, Phishing
	Confidence  float64   `json:"confidence"`  // Confidence level (0.0 - 1.0)
	Timestamp   time.Time `json:"timestamp"`   // Time of prediction
}

// LoadModel loads a specified AI model from a JSON config file.
func LoadModel(configPath string) (*Model, error) {
	file, err := os.Open(configPath)
	if err != nil {
		log.Printf("Error opening model config: %v", err)
		return nil, errors.New("failed to load model configuration")
	}
	defer file.Close()

	var model Model
	byteValue, _ := ioutil.ReadAll(file)
	if err := json.Unmarshal(byteValue, &model); err != nil {
		log.Printf("Error decoding model config: %v", err)
		return nil, errors.New("invalid model configuration")
	}

	log.Printf("Model loaded: %s from path %s", model.Name, model.Path)
	return &model, nil
}

// PredictThreat simulates threat analysis using the AI model.
func (m *Model) PredictThreat(data []byte) (*Prediction, error) {
	// Simulate data processing delay
	time.Sleep(time.Duration(rand.Intn(3)) * time.Second)

	// Simulated prediction based on random generation for demonstration
	threatLevels := []string{"Low", "Medium", "High", "Critical"}
	threatTypes := []string{"Malware", "Phishing", "Ransomware", "Insider Threat"}
	confidence := rand.Float64()

	prediction := &Prediction{
		ThreatLevel: threatLevels[rand.Intn(len(threatLevels))],
		ThreatType:  threatTypes[rand.Intn(len(threatTypes))],
		Confidence:  confidence,
		Timestamp:   time.Now(),
	}

	log.Printf("Prediction generated: ThreatLevel=%s, ThreatType=%s, Confidence=%.2f",
		prediction.ThreatLevel, prediction.ThreatType, prediction.Confidence)
	return prediction, nil
}

// RunPrediction receives input data and returns a threat prediction.
func RunPrediction(modelPath string, data []byte) (*Prediction, error) {
	model, err := LoadModel(modelPath)
	if err != nil {
		return nil, fmt.Errorf("error loading model: %w", err)
	}

	return model.PredictThreat(data)
}
