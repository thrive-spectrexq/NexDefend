package auth

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// User struct for storing user data
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

// hashPassword hashes a password using bcrypt
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// checkPasswordHash checks if a password matches a hash
func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// RegisterHandler handles new user registrations
func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract user details from the request body
		var user User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Validate that all required fields are present
		if user.Username == "" || user.Password == "" || user.Email == "" {
			http.Error(w, "Username, password, and email are required", http.StatusBadRequest)
			return
		}

		// Hash the password
		hashedPassword, err := hashPassword(user.Password)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Insert the new user into the database
		_, err = db.Exec("INSERT INTO users (username, password, email) VALUES ($1, $2, $3)", user.Username, hashedPassword, user.Email)
		if err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// LoginHandler handles user login and returns JWT upon success
func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract user details from the request body
		var creds User
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		// Get the user from the database
		var user User
		err = db.QueryRow("SELECT id, username, password, email FROM users WHERE username = $1", creds.Username).Scan(&user.ID, &user.Username, &user.Password, &user.Email)
		if err != nil {
			if err == sql.ErrNoRows {
				http.Error(w, "Invalid username or password", http.StatusUnauthorized)
				return
			}
			http.Error(w, "Failed to get user", http.StatusInternalServerError)
			return
		}

		// Check if the password is correct
		if !checkPasswordHash(creds.Password, user.Password) {
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
}
