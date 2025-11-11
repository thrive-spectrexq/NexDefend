package cache

import (
	"sync"
	"time"
)

// CacheItem represents an item in the cache
type CacheItem struct {
	Value      interface{}
	Expiration int64
}

// Cache is a simple in-memory cache
type Cache struct {
	items map[string]CacheItem
	mutex sync.RWMutex
}

// NewCache creates a new in-memory cache
func NewCache() *Cache {
	return &Cache{
		items: make(map[string]CacheItem),
	}
}

// Set adds an item to the cache
func (c *Cache) Set(key string, value interface{}, duration time.Duration) {
	c.mutex.Lock()
	defer c.mutex.Unlock()

	expiration := time.Now().Add(duration).UnixNano()
	c.items[key] = CacheItem{
		Value:      value,
		Expiration: expiration,
	}
}

// Get retrieves an item from the cache
func (c *Cache) Get(key string) (interface{}, bool) {
	c.mutex.RLock()
	defer c.mutex.RUnlock()

	item, found := c.items[key]
	if !found {
		return nil, false
	}

	if time.Now().UnixNano() > item.Expiration {
		// The item has expired, but we don't delete it here.
		// It will be overwritten by the next Set operation.
		return nil, false
	}

	return item.Value, true
}
