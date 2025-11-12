package upload

import (
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"github.com/thrive-spectrexq/NexDefend/internal/incident"
)

const MaxUploadSize = 10 * 1024 * 1024
var allowedFileTypes = []string{".txt", ".csv", ".log", ".pcap", ".json"}

type contextKey string

const organizationIDKey contextKey = "organizationID"

type UploadResponse struct {
	Filename       string `json:"filename"`
	FilePath       string `json:"file_path"`
	FileSize       int64  `json:"file_size"`
	AnalysisResult string `json:"analysis_result"`
	Alert          bool   `json:"alert"`
	Hash           string `json:"hash"`
	Message        string `json:"message"`
}

func checkMalwareHash(db *sql.DB, hash string) (isMalware bool, malwareName string) {
	query := "SELECT malware_name FROM malware_hash_registry WHERE hash = $1"
	err := db.QueryRow(query, hash).Scan(&malwareName)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, ""
		}
		log.Printf("Error checking malware hash: %v", err)
		return false, ""
	}
	return true, malwareName
}

func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(organizationIDKey).(int)
	if !ok {
		http.Error(w, "Organization ID not found", http.StatusInternalServerError)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize)
	if err := r.ParseMultipartForm(MaxUploadSize); err != nil {
		http.Error(w, "File too big!", http.StatusBadRequest)
		log.Printf("File too big: %v", err)
		return
	}
	file, handler, err := r.FormFile("uploadFile")
	if err != nil {
		http.Error(w, "Unable to retrieve file!", http.StatusBadRequest)
		log.Printf("Unable to retrieve file: %v", err)
		return
	}
	defer file.Close()
	log.Printf("File upload initiated: %s by %s", handler.Filename, r.RemoteAddr)
	safeFilename := filepath.Base(handler.Filename)
	if strings.Contains(safeFilename, "..") || safeFilename == "" {
		http.Error(w, "Invalid file name!", http.StatusBadRequest)
		log.Printf("Invalid file name: %s", handler.Filename)
		return
	}
	fileExt := strings.ToLower(filepath.Ext(safeFilename))
	if !isAllowedFileType(fileExt) {
		http.Error(w, "Unsupported file type!", http.StatusBadRequest)
		log.Printf("Unsupported file type: %s", fileExt)
		return
	}
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Failed to create upload directory!", http.StatusInternalServerError)
		log.Printf("Failed to create upload directory: %v", err)
		return
	}
	dstPath := filepath.Join(uploadDir, uuid.New().String()+fileExt)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, "Unable to save the file!", http.StatusInternalServerError)
		log.Printf("Unable to save file: %v", err)
		return
	}
	defer dst.Close()
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save the file!", http.StatusInternalServerError)
		log.Printf("Failed to save file: %v", err)
		return
	}

	hash := generateFileHash(dstPath)
	fileSize := handler.Size
	alert := false
	analysisResult := "File appears clean"

	database := db.GetDB()
	isMalware, malwareName := checkMalwareHash(database, hash)
	if isMalware {
		alert = true
		analysisResult = fmt.Sprintf("MALWARE DETECTED: %s", malwareName)
		log.Printf("[UPLOAD] CRITICAL: Malware detected in file %s. Hash: %s, Name: %s", safeFilename, hash, malwareName)

		incidentReq := incident.CreateIncidentRequest{
			Description: fmt.Sprintf("Malware Detected in Upload: %s (File: %s)", malwareName, safeFilename),
			Severity:    incident.SeverityCritical,
		}
		if _, err := incident.CreateIncident(database, incidentReq, orgID); err != nil {
			log.Printf("[UPLOAD] Error creating incident for malware: %v", err)
		}
	}

	if err := saveFileDetails(safeFilename, dstPath, fileSize, hash, analysisResult, alert, orgID); err != nil {
		http.Error(w, "Failed to record file details!", http.StatusInternalServerError)
		log.Printf("Database error: %v", err)
		return
	}

	response := UploadResponse{
		Filename:       safeFilename,
		FilePath:       dstPath,
		FileSize:       fileSize,
		AnalysisResult: analysisResult,
		Alert:          alert,
		Hash:           hash,
		Message:        "File uploaded and analyzed successfully",
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

	log.Printf("File uploaded and analyzed: %+v", response)
}

func saveFileDetails(filename, filePath string, fileSize int64, hash, analysisResult string, alert bool, organizationID int) error {
	query := `
        INSERT INTO uploaded_files (filename, file_path, file_size, hash, analysis_result, alert, organization_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
	_, err := db.GetDB().Exec(query, filename, filePath, fileSize, hash, analysisResult, alert, organizationID)
	return err
}

func isAllowedFileType(ext string) bool {
	for _, allowedExt := range allowedFileTypes {
		if ext == allowedExt {
			return true
		}
	}
	return false
}

func generateFileHash(filePath string) string {
	file, err := os.Open(filePath)
	if err != nil {
		log.Printf("Error opening file for hashing: %v", err)
		return ""
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		log.Printf("Error hashing file: %v", err)
		return ""
	}

	return hex.EncodeToString(hasher.Sum(nil))
}
