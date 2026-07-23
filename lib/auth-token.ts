// Small localStorage-backed store for the auth session (JWT + basic user info).
// This is the single source of truth that both the API client and the
// AuthProvider read/write. (Tradeoff noted earlier: localStorage is convenient
// but XSS-exposed; an httpOnly cookie would be the hardened production choice.)

export interface AuthUser {
  id: string;
  email: string;
}

const TOKEN_KEY = "expense-tracker.token";
const USER_KEY = "expense-tracker.user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: AuthUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
