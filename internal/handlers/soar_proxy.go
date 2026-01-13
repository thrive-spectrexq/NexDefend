package handlers

import (
	"io"
	"net/http"
	"net/url"
)

// SoarProxyHandler forwards requests to the independent SOAR service
type SoarProxyHandler struct {
	TargetURL string
}

func NewSoarProxyHandler(targetURL string) *SoarProxyHandler {
	// Default to local docker service name if not provided
	if targetURL == "" {
		targetURL = "http://nexdefend-soar:8080"
	}
	return &SoarProxyHandler{TargetURL: targetURL}
}

func (h *SoarProxyHandler) ProxyRequest(w http.ResponseWriter, r *http.Request) {
	// 1. Construct Target URL
	// Incoming: /api/v1/playbooks -> Outgoing: http://soar:8080/api/v1/playbooks
	target, err := url.Parse(h.TargetURL)
	if err != nil {
		http.Error(w, "Invalid SOAR configuration", http.StatusInternalServerError)
		return
	}

	// Preserve the path
	target.Path = r.URL.Path
	target.RawQuery = r.URL.RawQuery

	// 2. Create Proxy Request
	proxyReq, err := http.NewRequest(r.Method, target.String(), r.Body)
	if err != nil {
		http.Error(w, "Failed to create proxy request", http.StatusInternalServerError)
		return
	}

	// Copy Headers
	for name, values := range r.Header {
		for _, value := range values {
			proxyReq.Header.Add(name, value)
		}
	}

	// 3. Send Request
	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		http.Error(w, "SOAR Service Unreachable", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// 4. Copy Response Back
	for name, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(name, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
