package user

import "time"

// User is an account. PasswordHash holds a bcrypt hash — we NEVER store or log
// the plain password, and this struct is never serialized to JSON directly.
type User struct {
	ID           string
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}
