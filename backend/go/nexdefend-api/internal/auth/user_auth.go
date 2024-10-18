package auth

import (
	"encoding/json"
	"net/http"
)

var users = map[string]struct {
	ID       int
	Password string
}{
	"admin": {ID: 1, Password: "password123"}, // Example hardcoded user with an ID
}

// RegisterHandler handles new user registrations
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	// Extract user details from the request body
	var creds map[string]string
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Simple user creation (in memory)
	username := creds["username"]
	password := creds["password"]
	if _, exists := users[username]; exists {
		http.Error(w, "User already exists", http.StatusConflict)
		return
	}

	// Assign a new ID to the user
	newID := len(users) + 1
	users[username] = struct {
		ID       int
		Password string
	}{ID: newID, Password: password}

	w.WriteHeader(http.StatusCreated)
}

// LoginHandler handles user login and returns JWT upon success
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Extract user details from the request body
	var creds map[string]string
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Validate user credentials
	username := creds["username"]
	password := creds["password"]
	user, exists := users[username]
	if !exists || user.Password != password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT using the user ID
	token, err := GenerateJWT(user.ID)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Return the JWT token
	json.NewEncoder(w).Encode(map[string]string{
		"token": token,
	})
}
