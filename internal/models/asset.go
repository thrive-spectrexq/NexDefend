package models

import "time"

// Asset represents an asset in the system.
type Asset struct {
	ID             int       `json:"id" gorm:"primaryKey"`
	Hostname       string    `json:"hostname" gorm:"index"`
	IPAddress      string    `json:"ip_address"`
	OSVersion      string    `json:"os_version"`
	MACAddress     string    `json:"mac_address"`
	AgentVersion   string    `json:"agent_version"`
	Status         string    `json:"status"`
	LastHeartbeat  time.Time `json:"last_heartbeat"`
	Criticality    string    `json:"criticality"`
	OrganizationID int       `json:"organization_id"`
}

// CloudAsset represents a resource in a cloud provider (AWS, Azure, GCP).
type CloudAsset struct {
	ID          int       `json:"id" gorm:"primaryKey"`
	InstanceID  string    `json:"instance_id" gorm:"uniqueIndex"`
	Name        string    `json:"name"`
	Type        string    `json:"type"`
	State       string    `json:"state"`
	PublicIP    string    `json:"public_ip"`
	PrivateIP   string    `json:"private_ip"`
	Region      string    `json:"region"`
	Provider    string    `json:"provider"` // aws, azure, gcp
	DetectedAt  time.Time `json:"detected_at"`
}

// KubernetesPod represents a Pod in a K8s cluster.
type KubernetesPod struct {
	ID        int       `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"uniqueIndex:idx_pod_namespace"`
	Namespace string    `json:"namespace" gorm:"uniqueIndex:idx_pod_namespace"`
	Phase     string    `json:"phase"`
	NodeName  string    `json:"node_name"`
	PodIP     string    `json:"pod_ip"`
	UpdatedAt time.Time `json:"updated_at"`
}
