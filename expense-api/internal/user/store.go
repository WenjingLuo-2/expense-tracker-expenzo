package user

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	// ErrNotFound is returned when no user matches.
	ErrNotFound = errors.New("user not found")
	// ErrEmailTaken is returned when an email is already registered.
	ErrEmailTaken = errors.New("email already registered")
)

// Store is the persistence boundary for users (a Repository, in Java terms).
type Store interface {
	Create(u User) error
	GetByEmail(email string) (User, error)
}

type PostgresStore struct {
	pool *pgxpool.Pool
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool}
}

func (s *PostgresStore) Create(u User) error {
	_, err := s.pool.Exec(context.Background(),
		`INSERT INTO users (id, email, password_hash, created_at) VALUES ($1, $2, $3, $4)`,
		u.ID, u.Email, u.PasswordHash, u.CreatedAt)

	// The UNIQUE constraint on email raises Postgres error 23505
	// (unique_violation). We translate that into a clean domain error.
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return ErrEmailTaken
	}
	return err
}

func (s *PostgresStore) GetByEmail(email string) (User, error) {
	var u User
	err := s.pool.QueryRow(context.Background(),
		`SELECT id, email, password_hash, created_at FROM users WHERE email = $1`, email).
		Scan(&u.ID, &u.Email, &u.PasswordHash, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return User{}, ErrNotFound
	}
	if err != nil {
		return User{}, err
	}
	return u, nil
}
