package auth

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("secret_key")

// Claims struct for storing the user ID in the JWT token
type Claims struct {
	UserID int `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateJWT generates a JWT token for a user based on user ID
func GenerateJWT(userId int) (string, error) {
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
func JWTMiddleware(next http.Handler) http.Handler {
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

		// Parse and validate the token
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// Proceed to the next handler if token is valid
		next.ServeHTTP(w, r)
	})
}
