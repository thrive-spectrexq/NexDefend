package models

import (
	"time"

	"gorm.io/gorm"
)

// SuricataEvent represents a network security event detected by Suricata.
type SuricataEvent struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Timestamp  time.Time `json:"timestamp"`
	EventType  string    `json:"event_type"`
	SrcIP      string    `json:"src_ip"`
	DestIP     string    `json:"dest_ip"`
	DestPort   int       `json:"dest_port"`
	Proto      string    `json:"proto"`
	AppProto   string    `json:"app_proto"`
	HTTP       string    `json:"http" gorm:"type:text"` // Storing JSON or complex struct as text/json
	TLS        string    `json:"tls" gorm:"type:text"`
	DNS        string    `json:"dns" gorm:"type:text"`
	Alert      string    `json:"alert" gorm:"type:text"`
	IsAnalyzed bool      `json:"is_analyzed" gorm:"default:false"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName overrides the table name used by User to `suricata_events`
func (SuricataEvent) TableName() string {
	return "suricata_events"
}
