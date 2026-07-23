import type { Expense } from "./types";
import type { NewExpense } from "@/hooks/useExpenses";
import { clearSession, getToken, type AuthUser } from "./auth-token";

// Base URL of the Go backend. Configured per-environment via an env var.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// The shape the Go API returns for an expense (money as integer cents).
interface ApiExpense {
  id: string;
  date: string;
  amountCents: number;
  category: Expense["category"];
  description: string;
  createdAt: string;
}

function toExpense(a: ApiExpense): Expense {
  return {
    id: a.id,
    date: a.date,
    amount: a.amountCents / 100, // cents -> dollars
    category: a.category,
    description: a.description,
    createdAt: a.createdAt,
  };
}

function toApiBody(input: NewExpense) {
  return {
    date: input.date,
    amountCents: Math.round(input.amount * 100), // dollars -> cents
    category: input.category,
    description: input.description,
  };
}

// Pull a human-friendly message out of the API's error body.
async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error?.message) return body.error.message;
    if (typeof body?.error === "string") return body.error;
  } catch {
    // no JSON body
  }
  return `Request failed (${res.status})`;
}

// ---------------------------------------------------------------------------
// Auth endpoints (no token required, and a 401 here means "wrong credentials"
// — it should surface on the login form, NOT trigger a redirect loop).
// ---------------------------------------------------------------------------

export interface AuthResult {
  token: string;
  user: AuthUser;
}

async function authRequest(path: string, email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export function registerRequest(email: string, password: string): Promise<AuthResult> {
  return authRequest("/api/auth/register", email, password);
}

export function loginRequest(email: string, password: string): Promise<AuthResult> {
  return authRequest("/api/auth/login", email, password);
}

// ---------------------------------------------------------------------------
// Authenticated requests (expenses). Attaches the Bearer token; if the server
// rejects the token (401), the session is stale — clear it and bounce to login.
// ---------------------------------------------------------------------------

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== "undefined") window.location.assign("/login");
    throw new Error("Your session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(await parseError(res));
  return res;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await authedFetch("/api/expenses");
  const data: ApiExpense[] = await res.json();
  return data.map(toExpense);
}

export async function createExpense(input: NewExpense): Promise<Expense> {
  const res = await authedFetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiBody(input)),
  });
  return toExpense(await res.json());
}

export async function updateExpense(id: string, input: NewExpense): Promise<Expense> {
  const res = await authedFetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiBody(input)),
  });
  return toExpense(await res.json());
}

export async function deleteExpense(id: string): Promise<void> {
  await authedFetch(`/api/expenses/${id}`, { method: "DELETE" });
}
