package expense

import (
	"errors"
	"sort"
	"sync"
)

// ErrNotFound is returned when no matching expense exists FOR THAT USER.
var ErrNotFound = errors.New("expense not found")

// Store is the persistence boundary. Every method is scoped by userID so one
// user can never touch another's data — the core of multi-tenant isolation.
type Store interface {
	List(userID string) ([]Expense, error)
	Get(userID, id string) (Expense, error)
	Create(e Expense) error // e.UserID identifies the owner
	Update(e Expense) error // scoped to e.UserID
	Delete(userID, id string) error
}

// MemoryStore is an in-memory Store (handy for tests).
type MemoryStore struct {
	mu    sync.RWMutex
	items map[string]Expense
}

func NewMemoryStore() *MemoryStore {
	return &MemoryStore{items: make(map[string]Expense)}
}

func (s *MemoryStore) List(userID string) ([]Expense, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := make([]Expense, 0)
	for _, e := range s.items {
		if e.UserID == userID { // only this user's rows
			out = append(out, e)
		}
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Date != out[j].Date {
			return out[i].Date > out[j].Date
		}
		return out[i].CreatedAt.After(out[j].CreatedAt)
	})
	return out, nil
}

func (s *MemoryStore) Get(userID, id string) (Expense, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	e, ok := s.items[id]
	if !ok || e.UserID != userID { // not found OR not yours -> same answer
		return Expense{}, ErrNotFound
	}
	return e, nil
}

func (s *MemoryStore) Create(e Expense) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.items[e.ID] = e
	return nil
}

func (s *MemoryStore) Update(e Expense) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, ok := s.items[e.ID]
	if !ok || existing.UserID != e.UserID {
		return ErrNotFound
	}
	s.items[e.ID] = e
	return nil
}

func (s *MemoryStore) Delete(userID, id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	e, ok := s.items[id]
	if !ok || e.UserID != userID {
		return ErrNotFound
	}
	delete(s.items, id)
	return nil
}
