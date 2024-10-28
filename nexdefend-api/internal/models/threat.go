package models

import (
	"time"
)

type Threat struct {
	ID          int       `json:"id"`
	Description string    `json:"description"`
	DetectedAt  time.Time `json:"detected_at"`
	Severity    string    `json:"severity"`
}
