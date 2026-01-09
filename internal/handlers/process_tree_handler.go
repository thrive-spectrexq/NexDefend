package handlers

import (
	"bytes"
	"io"
	"net/http"
)

type ProcessTreeHandler struct {
	PythonAPIURL string
}

func NewProcessTreeHandler(pythonAPIURL string) *ProcessTreeHandler {
	return &ProcessTreeHandler{PythonAPIURL: pythonAPIURL}
}

func (h *ProcessTreeHandler) AnalyzeProcessTree(w http.ResponseWriter, r *http.Request) {
	// Forward the request body (process list) to the Python AI service
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	resp, err := http.Post(h.PythonAPIURL+"/analyze-process-tree", "application/json", bytes.NewBuffer(body))
	if err != nil {
		http.Error(w, "Failed to communicate with AI service", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
