package upload

import (
	"fmt"
	"io"
	"net/http"
	"os"
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
		return
	}

	// Get the uploaded file
	file, handler, err := r.FormFile("uploadFile")
	if err != nil {
		http.Error(w, "Unable to retrieve file!", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Create destination file
	dst, err := os.Create("./uploads/" + handler.Filename)
	if err != nil {
		http.Error(w, "Unable to save the file!", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	// Copy the uploaded file data to the destination file
	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save the file!", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "File uploaded successfully: %s", handler.Filename)
}
