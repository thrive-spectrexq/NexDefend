package upload

import (
	"github.com/thrive-spectrexq/NexDefend/internal/db"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

const MaxUploadSize = 10 * 1024 * 1024 // 10MB

// UploadFileHandler handles file uploads, analysis, and database storage.
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

	// Ensure the uploads directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		http.Error(w, "Failed to create upload directory!", http.StatusInternalServerError)
		log.Printf("Failed to create upload directory: %v", err)
		return
	}

	// Save the uploaded file to the server
	dstPath := filepath.Join(uploadDir, handler.Filename)
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

	// File analysis (basic example: checking file size)
	fileSize := handler.Size
	alert := false
	analysisResult := "File appears clean"
	if fileSize > MaxUploadSize {
		alert = true
		analysisResult = "File exceeds safe size limit"
	}

	// Save details to database
	if err := saveFileDetails(handler.Filename, dstPath, fileSize, analysisResult, alert); err != nil {
		http.Error(w, "Failed to record file details!", http.StatusInternalServerError)
		log.Printf("Database error: %v", err)
		return
	}

	// Response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File uploaded and analyzed: %s", handler.Filename)
	log.Printf("File uploaded and analyzed: %s", handler.Filename)
}

// saveFileDetails saves file information and analysis results in the database.
func saveFileDetails(filename, filePath string, fileSize int64, analysisResult string, alert bool) error {
	query := `
        INSERT INTO uploaded_files (filename, file_path, file_size, analysis_result, alert)
        VALUES ($1, $2, $3, $4, $5)
    `
	// Use db.GetDB() to get the database instance
	_, err := db.GetDB().Exec(query, filename, filePath, fileSize, analysisResult, alert)
	return err
}
