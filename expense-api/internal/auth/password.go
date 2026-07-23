package auth

import "golang.org/x/crypto/bcrypt"

// HashPassword turns a plain password into a bcrypt hash. bcrypt is slow ON
// PURPOSE (that's what makes brute-forcing stolen hashes expensive) and it
// embeds a random salt inside the hash. Java analog: Spring Security's
// BCryptPasswordEncoder.encode().
func HashPassword(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// CheckPassword reports whether the plain password matches the stored hash.
// bcrypt re-derives the salt from the hash, so we never store the salt ourselves.
func CheckPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
