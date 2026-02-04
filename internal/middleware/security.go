package middleware

import (
	"net/http"
)

// SecurityHeadersMiddleware adds security headers to responses
func SecurityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Content Security Policy
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none'; frame-ancestors 'none'; base-uri 'self';")

		// Anti-clickjacking
		w.Header().Set("X-Frame-Options", "DENY")

		// XSS Protection
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		// Prevent MIME sniffing
		w.Header().Set("X-Content-Type-Options", "nosniff")

		// Referrer Policy
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")

		// HSTS (Strict Transport Security) - Enable if HTTPS is enforced
		// w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		next.ServeHTTP(w, r)
	})
}
