package auth

import (
	"context"
	"net/http"
	"strings"
)

// ctxKey is an unexported type for context keys, so no other package can
// collide with ours. Storing the key type privately is the Go idiom.
type ctxKey int

const userIDKey ctxKey = 0

// Middleware returns a wrapper that requires a valid Bearer token. On success
// it puts the authenticated user id into the request context and calls the next
// handler; on failure it responds 401 and stops. This is the "auth filter".
func Middleware(tokens *TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Expect: Authorization: Bearer <token>
			raw := r.Header.Get("Authorization")
			token, ok := strings.CutPrefix(raw, "Bearer ")
			if !ok || token == "" {
				writeError(w, http.StatusUnauthorized, "missing or malformed Authorization header")
				return
			}

			userID, err := tokens.Parse(token)
			if err != nil {
				writeError(w, http.StatusUnauthorized, "invalid or expired token")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserIDFromContext returns the authenticated user id placed by Middleware.
func UserIDFromContext(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(userIDKey).(string)
	return id, ok
}
