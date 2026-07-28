package expense

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresStore is a Store backed by PostgreSQL. Same interface as MemoryStore.
type PostgresStore struct {
	pool *pgxpool.Pool
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool}
}

const columns = `id, user_id, date, amount_cents, category, description, tag, created_at`

func scanExpense(row pgx.Row) (Expense, error) {
	var (
		e   Expense
		d   time.Time
		cat string
	)
	if err := row.Scan(&e.ID, &e.UserID, &d, &e.AmountCents, &cat, &e.Description, &e.Tag, &e.CreatedAt); err != nil {
		return Expense{}, err
	}
	e.Date = d.Format("2006-01-02")
	e.Category = Category(cat)
	return e, nil
}

func (s *PostgresStore) List(userID string) ([]Expense, error) {
	rows, err := s.pool.Query(context.Background(),
		`SELECT `+columns+` FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC`,
		userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]Expense, 0)
	for rows.Next() {
		e, err := scanExpense(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

func (s *PostgresStore) Get(userID, id string) (Expense, error) {
	// Scoped by BOTH id and user_id: asking for someone else's id returns
	// ErrNotFound, exactly as if it didn't exist.
	row := s.pool.QueryRow(context.Background(),
		`SELECT `+columns+` FROM expenses WHERE id = $1 AND user_id = $2`, id, userID)
	e, err := scanExpense(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return Expense{}, ErrNotFound
	}
	if err != nil {
		return Expense{}, err
	}
	return e, nil
}

func (s *PostgresStore) Create(e Expense) error {
	_, err := s.pool.Exec(context.Background(),
		`INSERT INTO expenses (id, user_id, date, amount_cents, category, description, tag, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		e.ID, e.UserID, e.Date, e.AmountCents, string(e.Category), e.Description, e.Tag, e.CreatedAt)
	return err
}

func (s *PostgresStore) Update(e Expense) error {
	tag, err := s.pool.Exec(context.Background(),
		`UPDATE expenses SET date = $3, amount_cents = $4, category = $5, description = $6, tag = $7
		 WHERE id = $1 AND user_id = $2`,
		e.ID, e.UserID, e.Date, e.AmountCents, string(e.Category), e.Description, e.Tag)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 { // no row matched that id for this user
		return ErrNotFound
	}
	return nil
}

func (s *PostgresStore) Delete(userID, id string) error {
	tag, err := s.pool.Exec(context.Background(),
		`DELETE FROM expenses WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
