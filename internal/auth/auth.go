
package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
	"github.com/thrive-spectrexq/NexDefend/internal/metrics"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Claims struct for storing the user ID, roles, and organization ID in the JWT token
type Claims struct {
	UserID         int      `json:"user_id"`
	Roles          []string `json:"roles"`
	OrganizationID int      `json:"organization_id"`
	jwt.RegisteredClaims
}

// User struct
type User struct {
	ID             int    `json:"id"`
	Username       string `json:"username"`
	Password       string `json:"password"`
	Email          string `json:"email"`
	OrganizationID int    `json:"organization_id"`
}

// Context keys
type contextKey string

const (
	userClaimsKey     contextKey = "userClaims"
	organizationIDKey contextKey = "organizationID"
)

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateJWT generates a JWT token for a user
func GenerateJWT(userId int, roles []string, organizationID int, jwtKey []byte) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		UserID:         userId,
		Roles:          roles,
		OrganizationID: organizationID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			Subject:   fmt.Sprint(userId),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

// RegisterHandler handles new user registrations
func RegisterHandler(db *gorm.DB, jwtKey []byte) http.HandlerFunc {
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

		user.Password = hashedPassword
		if err := db.Create(&user).Error; err != nil {
			http.Error(w, "Failed to create user", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	}
}

// LoginHandler handles user login and returns JWT upon success
func LoginHandler(db *gorm.DB, jwtKey []byte) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds User
		err := json.NewDecoder(r.Body).Decode(&creds)
		if err != nil {
			metrics.UserLogins.WithLabelValues("failed").Inc()
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		var user User
		if err := db.Where("username = ?", creds.Username).First(&user).Error; err != nil {
			metrics.UserLogins.WithLabelValues("failed").Inc()
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}

		if !checkPasswordHash(creds.Password, user.Password) {
			metrics.UserLogins.WithLabelValues("failed").Inc()
			http.Error(w, "Invalid username or password", http.StatusUnauthorized)
			return
		}

		var roles []string
		if err := db.Table("roles").Select("roles.name").Joins("join user_roles on roles.id = user_roles.role_id").Where("user_roles.user_id = ?", user.ID).Scan(&roles).Error; err != nil {
			metrics.UserLogins.WithLabelValues("failed").Inc()
			http.Error(w, "Failed to get user roles", http.StatusInternalServerError)
			return
		}

		token, err := GenerateJWT(user.ID, roles, user.OrganizationID, jwtKey)
		if err != nil {
			metrics.UserLogins.WithLabelValues("failed").Inc()
			http.Error(w, "Failed to generate token", http.StatusInternalServerError)
			return
		}

		metrics.UserLogins.WithLabelValues("success").Inc()
		json.NewEncoder(w).Encode(map[string]string{
			"token": token,
		})
	}
}

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

			ctx := context.WithValue(r.Context(), userClaimsKey, claims)
			ctx = context.WithValue(ctx, organizationIDKey, claims.OrganizationID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
