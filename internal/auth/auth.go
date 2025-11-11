package auth

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	// "os" // REMOVED: Unused import
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/thrive-spectrexq/NexDefend/internal/config" // Import config
	"golang.org/x/crypto/bcrypt"
)

var jwtKey []byte // This will be set by LoadConfig

// Claims struct for storing the user ID in the JWT token
type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

// --- User Struct (Moved from user_auth.go) ---
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

// --- Helper Functions (Moved from user_auth.go) ---
func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// --- JWT Functions ---

// GenerateJWT generates a JWT token for a user based on user ID
func GenerateJWT(userId int, jwtKey []byte) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Subject:   fmt.Sprint(userId),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// --- Auth Handlers (Consolidated) ---

// RegisterHandler handles new user registrations
func RegisterHandler(db *sql.DB, jwtKey []byte) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var user User
		err := json.NewDecoder(r.Body).Decode(&user)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if user.Username == "" || user.Password == "" || user.Email == "" {
			http.Error(w, "Username, password, and email are required", http.StatusBadRequest)
			return
		}

		hashedPassword, err := hashPassword(user.Password)
		if err != nil {
			http.Error(w, "Failed to hash password", http.StatusInternalServerError)
			return
		}

		// Insert the new user into the database
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
		var creds User
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

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

		if !checkPasswordHash(creds.Password, user.Password) {
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}

		token, err := GenerateJWT(user.ID, jwtKey)
		if err != nil {
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{
			"token": token,
		})
	}
}

// --- JWT Middleware ---

// JWTMiddleware verifies the JWT token in the Authorization header
func JWTMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			tokenStr := r.Header.Get("Authorization")
			if tokenStr == "" {
				http.Error(w, "Authorization header missing", http.StatusUnauthorized)
				return
			}

			tokenParts := strings.Split(tokenStr, " ")
			if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
				http.Error(w, "Invalid token format", http.StatusUnauthorized)
				return
			}

			tokenStr = tokenParts[1]

			if tokenStr == cfg.AIServiceToken {
				next.ServeHTTP(w, r)
				return
			}

			claims := &Claims{}
			token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
				return cfg.JWTSecretKey, nil
			})

			if err != nil || !token.Valid {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
