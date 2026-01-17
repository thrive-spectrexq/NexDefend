package handlers

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

// ProxyToPython forwards requests from Frontend -> Go -> Python (Localhost)
func ProxyToPython(w http.ResponseWriter, r *http.Request) {
	// 1. Get Python URL (Internal Localhost)
	pythonServiceURL := os.Getenv("PYTHON_API")
	if pythonServiceURL == "" {
		pythonServiceURL = "http://localhost:5000"
	}

	// 2. Construct Target URL
	vars := mux.Vars(r)
	endpoint := vars["endpoint"]
	targetURL := fmt.Sprintf("%s/%s", pythonServiceURL, endpoint)

	// 3. Create Request
	body, _ := io.ReadAll(r.Body)
	// Re-create the body reader for the new request
	proxyReq, _ := http.NewRequest(r.Method, targetURL, bytes.NewBuffer(body))

	// Copy Query Parameters
	proxyReq.URL.RawQuery = r.URL.RawQuery

	// Copy Headers
	for name, values := range r.Header {
		for _, value := range values {
			proxyReq.Header.Add(name, value)
		}
	}

	// 4. Send to Python
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("Python Service Unreachable: %v", err)
		http.Error(w, "AI Service Unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// 5. Return Response to Frontend
	// Copy headers from response
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

// ProxyChatHandler handles chat requests to the AI service
type ProxyChatHandler struct {
	PythonURL string
	Token     string
}

func NewProxyChatHandler(url, token string) *ProxyChatHandler {
	return &ProxyChatHandler{PythonURL: url, Token: token}
}

func (h *ProxyChatHandler) ProxyChat(w http.ResponseWriter, r *http.Request) {
	// Use env var or config URL
	targetURL := fmt.Sprintf("%s/chat", h.PythonURL)
	if h.PythonURL == "" {
		targetURL = "http://localhost:5000/chat"
	}

	body, _ := io.ReadAll(r.Body)
	proxyReq, _ := http.NewRequest(r.Method, targetURL, bytes.NewBuffer(body))

	// Copy Headers
	for name, values := range r.Header {
		for _, value := range values {
			proxyReq.Header.Add(name, value)
		}
	}

	// Inject Token if needed (or rely on what comes from frontend if they share same auth)
	// But usually backend-to-backend might need a special token.
	// r.Header already copied.

	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("Chat Service Unreachable: %v", err)
		http.Error(w, "AI Service Unavailable", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// Copy headers from response
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
