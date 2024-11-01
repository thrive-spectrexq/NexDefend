package upload

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

// MaxUploadSize defines the max file size allowed for upload (e.g., 10 MB)
const MaxUploadSize = 10 * 1024 * 1024 // 10MB

// UploadFileHandler handles the file upload process
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

	// Create destination file
	dstPath := filepath.Join(uploadDir, handler.Filename)
	dst, err := os.Create(dstPath)
	if err != nil {
		http.Error(w, "Unable to save the file!", http.StatusInternalServerError)
		log.Printf("Unable to save file: %v", err)
		return
	}
	defer dst.Close()

	// Copy the uploaded file data to the destination file
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save the file!", http.StatusInternalServerError)
		log.Printf("Failed to save file: %v", err)
		return
	}

	// Respond with success message
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File uploaded successfully: %s", handler.Filename)
	log.Printf("File uploaded successfully: %s", handler.Filename)
}
