import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { SESSION_EXPIRED_EVENT, TOKEN_KEY, USER_KEY, read, write } from "../lib/api";

const AuthContext = createContext(null);

const cachedUser = () => {
  try {
    return read(TOKEN_KEY) ? JSON.parse(read(USER_KEY)) : null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => read(TOKEN_KEY));
  const [user, setUser] = useState(cachedUser);
  // While a saved session is being checked we do not know yet whether it is still valid
  const [loading, setLoading] = useState(() => Boolean(read(TOKEN_KEY)));

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
  }, []);

  const login = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    write(TOKEN_KEY, newToken);
    write(USER_KEY, JSON.stringify(newUser));
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      write(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // The API client raises this when the token is rejected
  useEffect(() => {
    const onExpired = () => {
      if (read(TOKEN_KEY)) logout();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [logout]);

  // Sign out in every tab when one tab signs out
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY && !e.newValue) {
        setToken(null);
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Keep the profile fresh; an invalid or expired token signs the user out
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .get("/users/me/self", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (cancelled) return;
        setUser(res.data.data);
        write(USER_KEY, JSON.stringify(res.data.data));
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (!cancelled && (status === 401 || status === 403)) logout();
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, updateUser }),
    [user, token, loading, login, logout, updateUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
