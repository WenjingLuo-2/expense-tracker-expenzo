package expense

import (
	"encoding/json"
	"errors"
	"net/http"

	"expense-api/internal/auth"
)

// Handler adapts HTTP requests to Service calls (the Controller layer).
type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

// Routes registers the endpoints, each wrapped with requireAuth so a valid
// token is mandatory and the caller's user id is in the request context.
func (h *Handler) Routes(mux *http.ServeMux, requireAuth func(http.Handler) http.Handler) {
	mux.Handle("GET /api/expenses", requireAuth(http.HandlerFunc(h.list)))
	mux.Handle("POST /api/expenses", requireAuth(http.HandlerFunc(h.create)))
	mux.Handle("PATCH /api/expenses/{id}", requireAuth(http.HandlerFunc(h.update)))
	mux.Handle("DELETE /api/expenses/{id}", requireAuth(http.HandlerFunc(h.delete)))
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	items, err := h.svc.List(userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not list expenses")
		return
	}
	writeJSON(w, http.StatusOK, items)
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	in, ok := decodeInput(w, r)
	if !ok {
		return
	}
	created, err := h.svc.Create(userID, in)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (h *Handler) update(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	id := r.PathValue("id")
	in, ok := decodeInput(w, r)
	if !ok {
		return
	}
	updated, err := h.svc.Update(userID, id, in)
	if err != nil {
		writeServiceError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (h *Handler) delete(w http.ResponseWriter, r *http.Request) {
	userID, _ := auth.UserIDFromContext(r.Context())
	id := r.PathValue("id")
	if err := h.svc.Delete(userID, id); err != nil {
		writeServiceError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// --- helpers ---

func decodeInput(w http.ResponseWriter, r *http.Request) (CreateInput, bool) {
	var in CreateInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return CreateInput{}, false
	}
	return in, true
}

func writeServiceError(w http.ResponseWriter, err error) {
	var ve ValidationError
	switch {
	case errors.As(err, &ve):
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"error": ve})
	case errors.Is(err, ErrNotFound):
		writeError(w, http.StatusNotFound, "expense not found")
	default:
		writeError(w, http.StatusInternalServerError, "internal error")
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
