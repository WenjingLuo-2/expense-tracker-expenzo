package expense

import (
	"fmt"
	"strings"
	"time"
)

const (
	maxAmountCents = 100_000_000 // $1,000,000.00 — a sanity ceiling
	maxTagLen      = 40
)

type IDGenerator func() string
type Clock func() time.Time

// Service holds business rules and validation. Every method takes the acting
// userID so ownership is enforced consistently.
type Service struct {
	store  Store
	nextID IDGenerator
	now    Clock
}

func NewService(store Store, nextID IDGenerator, now Clock) *Service {
	return &Service{store: store, nextID: nextID, now: now}
}

type CreateInput struct {
	Date        string   `json:"date"`
	AmountCents int64    `json:"amountCents"`
	Category    Category `json:"category"`
	Description string   `json:"description"`
	Tag         string   `json:"tag"`
}

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// validate returns the cleaned description and tag, and a ValidationError (or
// nil). The tag is optional; an empty tag is valid.
func validate(in CreateInput) (desc string, tag string, err error) {
	if in.AmountCents <= 0 {
		return "", "", ValidationError{Field: "amountCents", Message: "must be greater than 0"}
	}
	if in.AmountCents > maxAmountCents {
		return "", "", ValidationError{Field: "amountCents", Message: "amount is too large"}
	}
	if !in.Category.Valid() {
		return "", "", ValidationError{Field: "category", Message: "unknown category"}
	}

	desc = strings.TrimSpace(in.Description)
	if desc == "" {
		return "", "", ValidationError{Field: "description", Message: "description is required"}
	}
	if len(desc) > 120 {
		return "", "", ValidationError{Field: "description", Message: "description is too long"}
	}

	tag = strings.TrimSpace(in.Tag)
	if len(tag) > maxTagLen {
		return "", "", ValidationError{Field: "tag", Message: "tag is too long"}
	}

	if _, err := time.Parse("2006-01-02", in.Date); err != nil {
		return "", "", ValidationError{Field: "date", Message: "date must be YYYY-MM-DD"}
	}
	return desc, tag, nil
}

func (s *Service) List(userID string) ([]Expense, error) {
	return s.store.List(userID)
}

func (s *Service) Create(userID string, in CreateInput) (Expense, error) {
	desc, tag, err := validate(in)
	if err != nil {
		return Expense{}, err
	}
	e := Expense{
		ID:          s.nextID(),
		UserID:      userID,
		Date:        in.Date,
		AmountCents: in.AmountCents,
		Category:    in.Category,
		Description: desc,
		Tag:         tag,
		CreatedAt:   s.now(),
	}
	if err := s.store.Create(e); err != nil {
		return Expense{}, err
	}
	return e, nil
}

func (s *Service) Update(userID, id string, in CreateInput) (Expense, error) {
	desc, tag, err := validate(in)
	if err != nil {
		return Expense{}, err
	}
	// Get is scoped to userID, so you can only update your own row.
	existing, err := s.store.Get(userID, id)
	if err != nil {
		return Expense{}, err
	}
	existing.Date = in.Date
	existing.AmountCents = in.AmountCents
	existing.Category = in.Category
	existing.Description = desc
	existing.Tag = tag
	if err := s.store.Update(existing); err != nil {
		return Expense{}, err
	}
	return existing, nil
}

func (s *Service) Delete(userID, id string) error {
	return s.store.Delete(userID, id)
}
