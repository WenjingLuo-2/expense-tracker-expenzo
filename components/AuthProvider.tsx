"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { loginRequest, registerRequest } from "@/lib/api";
import {
  clearSession,
  getToken,
  getUser,
  setSession,
  type AuthUser,
} from "@/lib/auth-token";

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false); // has localStorage been read yet?
  const router = useRouter();
  const pathname = usePathname();

  // On mount, hydrate the session from localStorage (client-only).
  useEffect(() => {
    setToken(getToken());
    setUser(getUser());
    setLoaded(true);
  }, []);

  // Client-side route guard: bounce unauthenticated users to /login and
  // authenticated users away from /login.
  useEffect(() => {
    if (!loaded) return;
    if (!token && pathname !== "/login") router.replace("/login");
    if (token && pathname === "/login") router.replace("/");
  }, [loaded, token, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    setSession(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const res = await registerRequest(email, password);
    setSession(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  // Only render protected content once we KNOW the user is allowed here, so a
  // protected page never flashes before the redirect fires.
  const canRender = loaded && (Boolean(token) || pathname === "/login");

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {canRender ? children : <LoadingScreen />}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
    </div>
  );
}
