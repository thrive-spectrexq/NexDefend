package handlers

import (
	"bytes"
	"io"
	"net/http"
)

type ProxyChatHandler struct {
	PythonAPI string
	Token     string
}

func NewProxyChatHandler(pythonAPI string, token string) *ProxyChatHandler {
	return &ProxyChatHandler{PythonAPI: pythonAPI, Token: token}
}

func (h *ProxyChatHandler) ProxyChat(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request", http.StatusBadRequest)
		return
	}

	req, err := http.NewRequest("POST", h.PythonAPI+"/chat", bytes.NewBuffer(body))
	if err != nil {
		http.Error(w, "Error creating request", http.StatusInternalServerError)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+h.Token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "Error contacting AI service", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}
