package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/thrive-spectrexq/NexDefend/internal/auth"
)

func TestAuthMiddleware(t *testing.T) {
	jwtKey := []byte("test-secret")

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Test case with a valid token
	req := httptest.NewRequest("GET", "/", nil)
	token, _ := auth.GenerateJWT(1, []string{"admin"}, 1, jwtKey)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	AuthMiddleware(jwtKey)(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Test case with no token
	req = httptest.NewRequest("GET", "/", nil)
	rr = httptest.NewRecorder()
	AuthMiddleware(jwtKey)(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)

	// Test case with an invalid token
	req = httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	rr = httptest.NewRecorder()
	AuthMiddleware(jwtKey)(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}
