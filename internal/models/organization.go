package models

import "gorm.io/gorm"

// Organization represents a tenant or group within the system.
type Organization struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
}
