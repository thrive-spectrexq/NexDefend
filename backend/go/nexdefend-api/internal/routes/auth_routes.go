package routes

import (
	"encoding/json"
	"net/http"
	"nexdefend-api/internal/auth"
	"nexdefend-api/internal/models"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// Insert user into the database
	// (Password hashing, etc., will be added here)

	// Respond with success message
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"})
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	// Handle user login and return JWT token
	token, err := auth.GenerateJWT(1) // Mock user ID
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	// Respond with the token
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
