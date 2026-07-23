package auth

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"expense-api/internal/user"
)

// Handler serves the register/login endpoints.
type Handler struct {
	users  user.Store
	tokens *TokenService
	nextID func() string
	now    func() time.Time
}

func NewHandler(users user.Store, tokens *TokenService, nextID func() string, now func() time.Time) *Handler {
	return &Handler{users: users, tokens: tokens, nextID: nextID, now: now}
}

func (h *Handler) Routes(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/register", h.register)
	mux.HandleFunc("POST /api/auth/login", h.login)
}

type credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type publicUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type authResponse struct {
	Token string     `json:"token"`
	User  publicUser `json:"user"`
}

func (h *Handler) register(w http.ResponseWriter, r *http.Request) {
	creds, ok := decode(w, r)
	if !ok {
		return
	}
	email := normalizeEmail(creds.Email)
	if !strings.Contains(email, "@") || len(email) < 3 {
		writeError(w, http.StatusUnprocessableEntity, "a valid email is required")
		return
	}
	if len(creds.Password) < 8 {
		writeError(w, http.StatusUnprocessableEntity, "password must be at least 8 characters")
		return
	}

	hash, err := HashPassword(creds.Password)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not process password")
		return
	}

	u := user.User{ID: h.nextID(), Email: email, PasswordHash: hash, CreatedAt: h.now()}
	if err := h.users.Create(u); err != nil {
		if errors.Is(err, user.ErrEmailTaken) {
			writeError(w, http.StatusConflict, "that email is already registered")
			return
		}
		writeError(w, http.StatusInternalServerError, "could not create account")
		return
	}
	h.issueToken(w, u)
}

func (h *Handler) login(w http.ResponseWriter, r *http.Request) {
	creds, ok := decode(w, r)
	if !ok {
		return
	}
	u, err := h.users.GetByEmail(normalizeEmail(creds.Email))

	// Return the SAME error whether the email is unknown or the password is
	// wrong — telling them apart would let an attacker enumerate valid emails.
	if err != nil || !CheckPassword(u.PasswordHash, creds.Password) {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}
	h.issueToken(w, u)
}

func (h *Handler) issueToken(w http.ResponseWriter, u user.User) {
	token, err := h.tokens.Issue(u.ID, u.Email, h.now())
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not issue token")
		return
	}
	writeJSON(w, http.StatusOK, authResponse{
		Token: token,
		User:  publicUser{ID: u.ID, Email: u.Email},
	})
}

// --- small local helpers ---

func decode(w http.ResponseWriter, r *http.Request) (credentials, bool) {
	var c credentials
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return credentials{}, false
	}
	return c, true
}

func normalizeEmail(e string) string {
	return strings.ToLower(strings.TrimSpace(e))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
