package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// TokenService issues and verifies JWTs. A JWT is a signed, self-contained
// token: the server can trust its contents because they're signed with a
// secret only the server knows. No session table needed (stateless auth).
type TokenService struct {
	secret []byte
	ttl    time.Duration
}

func NewTokenService(secret string, ttl time.Duration) *TokenService {
	return &TokenService{secret: []byte(secret), ttl: ttl}
}

// Issue creates a signed token whose "subject" is the user id. `now` is passed
// in (not read from the clock) so it stays testable.
func (t *TokenService) Issue(userID, email string, now time.Time) (string, error) {
	claims := jwt.MapClaims{
		"sub":   userID,          // subject: who the token is about
		"email": email,           // convenience, not trusted for authorization
		"iat":   now.Unix(),      // issued-at
		"exp":   now.Add(t.ttl).Unix(), // expiry
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(t.secret)
}

// Parse verifies the signature and expiry, and returns the user id (sub).
func (t *TokenService) Parse(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
		// Guard against the classic "alg: none" / algorithm-swap attack: only
		// accept the HMAC method we actually signed with.
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return t.secret, nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid or expired token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid claims")
	}
	sub, _ := claims["sub"].(string)
	if sub == "" {
		return "", errors.New("token has no subject")
	}
	return sub, nil
}
