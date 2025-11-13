package models

import "time"

// UploadedFile represents a file that has been uploaded to the system.
type UploadedFile struct {
	ID             int       `json:"id"`
	Filename       string    `json:"filename"`
	FilePath       string    `json:"file_path"`
	UploadTime     time.Time `json:"upload_time"`
	FileSize       int64     `json:"file_size"`
	Hash           string    `json:"hash"`
	AnalysisResult string    `json:"analysis_result"`
	Alert          bool      `json:"alert"`
	OrganizationID int       `json:"organization_id"`
}
