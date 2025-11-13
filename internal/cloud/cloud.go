package cloud

import "time"

type CloudCredential struct {
	ID                  int       `json:"id"`
	OrganizationID      int       `json:"organization_id"`
	Provider            string    `json:"provider"`
	CredentialsEncrypted string    `json:"credentials_encrypted"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}
