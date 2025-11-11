package cache

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestCache(t *testing.T) {
	c := NewCache()

	// Test case: Set and get a value
	c.Set("key1", "value1", 1*time.Second)
	value, found := c.Get("key1")
	assert.True(t, found)
	assert.Equal(t, "value1", value)

	// Test case: Get an expired value
	time.Sleep(2 * time.Second)
	value, found = c.Get("key1")
	assert.False(t, found)
	assert.Nil(t, value)

	// Test case: Get a non-existent value
	value, found = c.Get("key2")
	assert.False(t, found)
	assert.Nil(t, value)
}
