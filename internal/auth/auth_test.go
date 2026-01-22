package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
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

func TestPasswordHashing(t *testing.T) {
	password := "securepassword"
	hash, err := HashPassword(password)
	assert.NoError(t, err)
	assert.NotEmpty(t, hash)

	match := CheckPasswordHash(password, hash)
	assert.True(t, match)

	match = CheckPasswordHash("wrongpassword", hash)
	assert.False(t, match)
}
