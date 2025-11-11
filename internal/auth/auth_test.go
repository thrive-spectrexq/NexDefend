package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

func TestGenerateJWT(t *testing.T) {
	tokenString, err := GenerateJWT(1)
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenString)

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	assert.NoError(t, err)

	claims, ok := token.Claims.(*Claims)
	assert.True(t, ok)
	assert.Equal(t, 1, claims.UserID)
	assert.WithinDuration(t, time.Now().Add(24*time.Hour), claims.ExpiresAt.Time, 10*time.Second)
}

func TestJWTMiddleware(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Test case with a valid token
	req := httptest.NewRequest("GET", "/", nil)
	token, _ := GenerateJWT(1)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	JWTMiddleware(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Test case with no token
	req = httptest.NewRequest("GET", "/", nil)
	rr = httptest.NewRecorder()
	JWTMiddleware(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)

	// Test case with an invalid token
	req = httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	rr = httptest.NewRecorder()
	JWTMiddleware(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}
