package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/thrive-spectrexq/NexDefend/internal/config"
)

func TestGenerateJWT(t *testing.T) {
	jwtKey := []byte("test-secret")
	tokenString, err := GenerateJWT(1, []string{"admin"}, 1, jwtKey)
	assert.NoError(t, err)
	assert.NotEmpty(t, tokenString)

	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	assert.NoError(t, err)

	claims, ok := token.Claims.(*Claims)
	assert.True(t, ok)
	assert.Equal(t, 1, claims.UserID)
	assert.Equal(t, []string{"admin"}, claims.Roles)
	assert.Equal(t, 1, claims.OrganizationID)
	assert.WithinDuration(t, time.Now().Add(24*time.Hour), claims.ExpiresAt.Time, 10*time.Second)
}

func TestJWTMiddleware(t *testing.T) {
	jwtKey := []byte("test-secret")
	cfg := &config.Config{
		JWTSecretKey: jwtKey,
	}

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Test case with a valid token
	req := httptest.NewRequest("GET", "/", nil)
	token, _ := GenerateJWT(1, []string{"admin"}, 1, jwtKey)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	JWTMiddleware(cfg)(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusOK, rr.Code)

	// Test case with no token
	req = httptest.NewRequest("GET", "/", nil)
	rr = httptest.NewRecorder()
	JWTMiddleware(cfg)(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)

	// Test case with an invalid token
	req = httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer invalid-token")
	rr = httptest.NewRecorder()
	JWTMiddleware(cfg)(handler).ServeHTTP(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}
