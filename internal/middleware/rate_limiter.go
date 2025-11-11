package middleware

import (
	"net/http"
	"sync"

	"golang.org/x/time/rate"
)

// RateLimiter is a middleware that limits the number of requests per client
func RateLimiter(next http.Handler, r rate.Limit, b int) http.Handler {
	visitors := make(map[string]*rate.Limiter)
	var mu sync.Mutex

	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		ip := req.RemoteAddr
		mu.Lock()
		if _, found := visitors[ip]; !found {
			visitors[ip] = rate.NewLimiter(r, b)
		}
		limiter := visitors[ip]
		mu.Unlock()

		if !limiter.Allow() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, req)
	})
}
