package middleware

import (
	"log"
	"net/http"
	"time"

	"github.com/thrive-spectrexq/NexDefend/internal/auth"
)

// AuditMiddleware logs sensitive actions
func AuditMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Only audit state-changing methods
		if r.Method == "POST" || r.Method == "PUT" || r.Method == "DELETE" {
			claims, ok := r.Context().Value(userClaimsKey).(*auth.Claims)
			userID := 0
			if ok {
				userID = claims.UserID
			}

			log.Printf("[AUDIT] User %d performed %s on %s at %s", userID, r.Method, r.URL.Path, time.Now())
		}
		next.ServeHTTP(w, r)
	})
}
