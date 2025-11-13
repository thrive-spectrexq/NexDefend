package middleware

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/thrive-spectrexq/NexDefend/internal/auth"
	"github.com/thrive-spectrexq/NexDefend/internal/db"
)

// AuditLogMiddleware logs user actions to the database
func AuditLogMiddleware(database *db.Database) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == "POST" || r.Method == "PUT" || r.Method == "DELETE" {
				claims, ok := r.Context().Value(userClaimsKey).(*auth.Claims)
				if !ok {
					// Don't log if there are no claims (e.g., login/register)
					next.ServeHTTP(w, r)
					return
				}

				vars := mux.Vars(r)
				targetID, _ := strconv.Atoi(vars["id"])

				var details []byte
				if r.Body != nil {
					details, _ = ioutil.ReadAll(r.Body)
					r.Body = ioutil.NopCloser(bytes.NewBuffer(details))
				}

				action := r.Method + " " + r.URL.Path
				targetType := getTargetType(r.URL.Path)

				err := database.GetDB().Exec(
					"INSERT INTO user_audit_log (user_id, action, target_type, target_id, details_json) VALUES (?, ?, ?, ?, ?)",
					claims.UserID,
					action,
					targetType,
					targetID,
					string(details),
				).Error
				if err != nil {
					// Log the error but don't block the request
					// In a real application, you'd use a proper logger here
					// For now, we'll just print to the console
					println("Failed to write to audit log:", err.Error())
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

func getTargetType(path string) string {
	parts := strings.Split(path, "/")
	if len(parts) > 2 {
		return parts[2]
	}
	return ""
}
