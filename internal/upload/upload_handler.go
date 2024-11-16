package upload

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
)

const MaxUploadSize = 10 * 1024 * 1024                  // 10MB
var allowedFileTypes = []string{".txt", ".csv", ".log"} // Add allowed extensions here

type UploadResponse struct {
	Filename       string `json:"filename"`
	FilePath       string `json:"file_path"`
	FileSize       int64  `json:"file_size"`
	AnalysisResult string `json:"analysis_result"`
	Alert          bool   `json:"alert"`
	Hash           string `json:"hash"`
	Message        string `json:"message"`
}

func UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	// Limit request body size
	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize)

	// Parse multipart form data
	if err := r.ParseMultipartForm(MaxUploadSize); err != nil {
		http.Error(w, "File too big!", http.StatusBadRequest)
		log.Printf("File too big: %v", err)
		return
	}

	// Get the uploaded file
	file, handler, err := r.FormFile("uploadFile")
	if err != nil {
		http.Error(w, "Unable to retrieve file!", http.StatusBadRequest)
		log.Printf("Unable to retrieve file: %v", err)
		return
	}
	defer file.Close()

	// Log the file upload initiation
	log.Printf("File upload initiated: %s by %s", handler.Filename, r.RemoteAddr)

	// Sanitize and validate the file name
	safeFilename := filepath.Base(handler.Filename)
	if strings.Contains(safeFilename, "..") || safeFilename == "" {
		http.Error(w, "Invalid file name!", http.StatusBadRequest)
		log.Printf("Invalid file name: %s", handler.Filename)
		return
	}

	// Validate file type
	fileExt := strings.ToLower(filepath.Ext(safeFilename))
	if !isAllowedFileType(fileExt) {
		http.Error(w, "Unsupported file type!", http.StatusBadRequest)
		log.Printf("Unsupported file type: %s", fileExt)
		return
	}

	// Ensure the uploads directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Failed to create upload directory!", http.StatusInternalServerError)
		log.Printf("Failed to create upload directory: %v", err)
		return
	}

	// Generate a unique destination path using UUID
	dstPath := filepath.Join(uploadDir, uuid.New().String()+fileExt)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, "Unable to save the file!", http.StatusInternalServerError)
		log.Printf("Unable to save file: %v", err)
		return
	}
	defer dst.Close()

	// Copy file data to destination
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save the file!", http.StatusInternalServerError)
		log.Printf("Failed to save file: %v", err)
		return
	}

	// Generate hash for the file
	hash := generateFileHash(dstPath)

	// File analysis (basic example: checking file size)
	fileSize := handler.Size
	alert := false
	analysisResult := "File appears clean"
	if fileSize > MaxUploadSize {
		alert = true
		analysisResult = "File exceeds safe size limit"
	}

	// Save details to database
	if err := saveFileDetails(safeFilename, dstPath, fileSize, hash, analysisResult, alert); err != nil {
		http.Error(w, "Failed to record file details!", http.StatusInternalServerError)
		log.Printf("Database error: %v", err)
		return
	}

	// Build and send response
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

func saveFileDetails(filename, filePath string, fileSize int64, hash, analysisResult string, alert bool) error {
	query := `
        INSERT INTO uploaded_files (filename, file_path, file_size, hash, analysis_result, alert)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
	_, err := db.GetDB().Exec(query, filename, filePath, fileSize, hash, analysisResult, alert)
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
