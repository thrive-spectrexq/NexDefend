package auth

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/thrive-spectrexq/NexDefend/internal/config" // Import config
)

// jwtKey is now set by LoadConfig and passed in.
// We'll update GenerateJWT and JWTMiddleware to accept the key.

// Claims struct for storing the user ID in the JWT token
type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateJWT generates a JWT token for a user based on user ID
func GenerateJWT(userId int, jwtKey []byte) (string, error) {
	// Set expiration time for the token (24 hours)
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userId, // Store user ID in the claims
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Subject:   fmt.Sprint(userId), // Use userId as the subject
		},
	}
	// Create a new token with the claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// JWTMiddleware verifies the JWT token in the Authorization header
func JWTMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract the token from the Authorization header
			tokenStr := r.Header.Get("Authorization")
			if tokenStr == "" {
				http.Error(w, "Authorization header missing", http.StatusUnauthorized)
				return
			}

			// The token should be in the format "Bearer <token>"
			tokenParts := strings.Split(tokenStr, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				http.Error(w, "Invalid token format", http.StatusUnauthorized)
				return
			}

			tokenStr = tokenParts[1]
			
			// --- Service-to-Service Auth Check ---
			// Check if it's the internal AI service token
			if tokenStr == cfg.AIServiceToken {
				// It's the AI service, grant access and bypass user JWT check
				next.ServeHTTP(w, r)
				return
			}
			
			// --- Regular User Auth Check ---
			// Parse and validate the user token
			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
				return cfg.JWTSecretKey, nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			
			// TODO: We can add the user ID to the request context here
			// ctx := context.WithValue(r.Context(), "userID", claims.UserID)
			// next.ServeHTTP(w, r.WithContext(ctx))
			
			// Proceed to the next handler if token is valid
			next.ServeHTTP(w, r)
		})
	}
}

// Update RegisterHandler and LoginHandler to get the key from config
// (This requires passing the *config.Config to them from main.go/routes.go)

// RegisterHandler handles new user registrations
func RegisterHandler(db *sql.DB, jwtKey []byte) http.HandlerFunc {
    // ... (rest of the function is the same)
	return func(w http.ResponseWriter, r *http.Request) {
		// ...
		// (No JWT generation needed on register)
		// ...
		// Hash the password
		hashedPassword, err := hashPassword(user.Password)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Insert the new user into the database
		// Set default role to 'user'
		_, err = db.Exec("INSERT INTO users (username, password, email, role) VALUES ($1, $2, $3, 'user')", user.Username, hashedPassword, user.Email)
		if err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// LoginHandler handles user login and returns JWT upon success
func LoginHandler(db *sql.DB, jwtKey []byte) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// ... (logic to get user and check hash)
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
		token, err := GenerateJWT(user.ID, jwtKey) // Pass the key
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}
		
		// ... (return token)
		json.NewEncoder(w).Encode(map[string]string{
			"token": token,
		})
	}
}
