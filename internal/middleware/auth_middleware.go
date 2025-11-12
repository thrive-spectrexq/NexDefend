package middleware

import (
	"net/http"

	"github.com/thrive-spectrexq/NexDefend/internal/auth"
)

type contextKey string

const userClaimsKey contextKey = "userClaims"

// RoleMiddleware checks if the user has the required role
func RoleMiddleware(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(userClaimsKey).(*auth.Claims)
			if !ok {
				http.Error(w, "User claims not found", http.StatusUnauthorized)
				return
			}

			hasRole := false
			for _, role := range claims.Roles {
				if role == requiredRole {
					hasRole = true
					break
				}
			}

			if !hasRole {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
