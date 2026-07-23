// Command server starts the expense-api HTTP service.
package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"

	"expense-api/internal/auth"
	"expense-api/internal/expense"
	"expense-api/internal/user"
)

func main() {
	// Load a local .env file if present (missing file is fine — env vars can
	// also come from the real environment, e.g. in production).
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set (copy .env.example to .env)")
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET is not set (copy .env.example to .env)")
	}

	// A connection POOL keeps a handful of live DB connections and hands them
	// out per request. Closest Java analog: a HikariCP connection pool.
	pool, err := pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("cannot create db pool: %v", err)
	}
	defer pool.Close()
	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("cannot reach database: %v", err)
	}
	log.Println("connected to Postgres")

	// --- stores (data layer) ---
	expenseStore := expense.NewPostgresStore(pool)
	userStore := user.NewPostgresStore(pool)

	// --- services / handlers ---
	tokens := auth.NewTokenService(jwtSecret, 7*24*time.Hour) // tokens valid for 7 days
	svc := expense.NewService(expenseStore, newID, time.Now)
	expenseHandler := expense.NewHandler(svc)
	authHandler := auth.NewHandler(userStore, tokens, newID, time.Now)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	requireAuth := auth.Middleware(tokens)

	authHandler.Routes(mux)                 // /api/auth/register, /api/auth/login (public)
	expenseHandler.Routes(mux, requireAuth) // /api/expenses... (token required)

	const addr = ":8080"
	log.Printf("expense-api listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, withMiddleware(mux)); err != nil {
		log.Fatal(err)
	}
}

// newID returns a random 128-bit hex id.
func newID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
