package models

import "gorm.io/gorm"

// Role represents a user role and permissions.
type Role struct {
	gorm.Model
	Name        string `json:"name" gorm:"unique"`
	Description string `json:"description"`
	Permissions string `json:"permissions"` // JSON string or comma-separated list
}
