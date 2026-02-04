package middleware

import (
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimiter is a middleware that limits the number of requests per client
func RateLimiter(next http.Handler, r rate.Limit, b int) http.Handler {
	visitors := make(map[string]*visitor)
	var mu sync.Mutex

	// Cleanup background routine
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			mu.Lock()
			for ip, v := range visitors {
				if time.Since(v.lastSeen) > 3*time.Minute {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
		ip := req.RemoteAddr

		mu.Lock()
		v, found := visitors[ip]
		if !found {
			v = &visitor{limiter: rate.NewLimiter(r, b)}
			visitors[ip] = v
		}
		v.lastSeen = time.Now()
		mu.Unlock()

		if !v.limiter.Allow() {
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}

		next.ServeHTTP(w, req)
	})
}
