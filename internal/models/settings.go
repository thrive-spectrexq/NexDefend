package models

import "gorm.io/gorm"

// SystemSettings represents global configuration for the platform
type SystemSettings struct {
	gorm.Model
	Key         string `gorm:"uniqueIndex;not null" json:"key"`
	Value       string `json:"value"`
	Category    string `json:"category"` // e.g., "general", "notifications", "integrations"
	Description string `json:"description"`
	IsSecret    bool   `json:"is_secret"` // If true, value should be masked in UI
}

// Default settings keys
const (
	SettingTheme             = "theme"
	SettingRefreshInterval   = "refresh_interval"
	SettingTimezone          = "timezone"
	SettingEmailEnabled      = "email_enabled"
	SettingEmailRecipient    = "email_recipient"
	SettingSlackWebhook      = "slack_webhook"
	SettingVirusTotalKey     = "virustotal_key"
	SettingOllamaURL         = "ollama_url"
	SettingLogRetention      = "log_retention_days"
	SettingAgentHeartbeat    = "agent_heartbeat_interval"
)
