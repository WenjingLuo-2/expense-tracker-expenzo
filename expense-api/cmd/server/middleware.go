package main

import (
	"log"
	"net/http"
	"time"
)

// withMiddleware wraps a handler with cross-cutting concerns. This is the same
// idea as a Servlet Filter / interceptor chain in Java: each layer wraps the
// next. Request flow here: logging -> cors -> the real handler.
func withMiddleware(next http.Handler) http.Handler {
	return logging(cors(next))
}

// logging records the method, path, and duration of every request.
func logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s (%s)", r.Method, r.URL.Path, time.Since(start))
	})
}

// cors lets the Next.js dev frontend (http://localhost:3000) call this API from
// the browser. The "*" origin is fine for local dev; we'll lock it down to the
// real frontend origin before deploying to production.
func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Browsers send a preflight OPTIONS request before the real one.
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
