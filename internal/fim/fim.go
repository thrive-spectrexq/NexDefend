package fim

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/incident" // Import our incident package
)

const defaultScanInterval = 1 * time.Minute

// hashFile calculates the SHA-256 hash of a file.
func hashFile(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hasher.Sum(nil)), nil
}

// BaselineDirectory scans a directory and stores file hashes in the database.
func BaselineDirectory(db *sql.DB, dirPath string) {
	log.Printf("[FIM] Starting baseline scan for directory: %s", dirPath)
	err := filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Only hash regular files
		if !info.Mode().IsRegular() {
			return nil
		}

		hash, err := hashFile(path)
		if err != nil {
			log.Printf("[FIM] Error hashing file %s: %v", path, err)
			return nil // Continue walking
		}

		// Insert or update the hash in the baseline
		query := `
            INSERT INTO fim_baseline (file_path, hash, last_checked)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (file_path) DO UPDATE
            SET hash = $2, last_checked = CURRENT_TIMESTAMP`
		
		_, err = db.Exec(query, path, hash)
		if err != nil {
			log.Printf("[FIM] Error updating baseline for %s: %v", path, err)
		}
		
		return nil
	})

	if err != nil {
		log.Printf("[FIM] Error walking baseline directory: %v", err)
	}
	log.Println("[FIM] Baseline scan complete.")
}

// RunWatcher starts the FIM service.
// It runs an initial baseline, then checks for changes on a ticker.
func RunWatcher(db *sql.DB, dirPath string) {
	// Run initial baseline
	BaselineDirectory(db, dirPath)

	// Start monitoring ticker
	ticker := time.NewTicker(defaultScanInterval)
	defer ticker.Stop()

	log.Printf("[FIM] Started watcher on %s (Interval: %v)", dirPath, defaultScanInterval)

	for range ticker.C {
		log.Println("[FIM] Running integrity check...")
		
		rows, err := db.Query("SELECT file_path, hash FROM fim_baseline")
		if err != nil {
			log.Printf("[FIM] Error querying baseline: %v", err)
			continue
		}
		defer rows.Close()

		for rows.Next() {
			var path, baselineHash string
			if err := rows.Scan(&path, &baselineHash); err != nil {
				log.Printf("[FIM] Error scanning row: %v", err)
				continue
			}

			currentHash, err := hashFile(path)
			if err != nil {
				if os.IsNotExist(err) {
					// File was deleted
					log.Printf("[FIM] CRITICAL: File deleted: %s", path)
					createFimIncident(db, fmt.Sprintf("File Integrity Violation: File DELETED: %s", path))
					// Remove from baseline
					db.Exec("DELETE FROM fim_baseline WHERE file_path = $1", path)
				}
				continue
			}

			if currentHash != baselineHash {
				// HASH MISMATCH
				log.Printf("[FIM] CRITICAL: File hash mismatch: %s", path)
				createFimIncident(db, fmt.Sprintf("File Integrity Violation: File MODIFIED: %s", path))
				
				// Update baseline to prevent repeated alerts for this change
				_, err := db.Exec("UPDATE fim_baseline SET hash = $1, last_checked = CURRENT_TIMESTAMP WHERE file_path = $2", currentHash, path)
				if err != nil {
					log.Printf("[FIM] Error updating baseline after mismatch: %v", err)
				}
			}
		}
	}
}

// createFimIncident is a helper to create a new incident
func createFimIncident(db *sql.DB, description string) {
	req := incident.CreateIncidentRequest{
		Description: description,
		Severity:    incident.SeverityCritical, // FIM violations are always high priority
		Status:      incident.StatusOpen,
	}
	_, err := incident.CreateIncident(db, req)
	if err != nil {
		log.Printf("[FIM] Error creating incident: %v", err)
	}
}
