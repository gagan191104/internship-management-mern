import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../services/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "internflow_token";
const USER_KEY = "internflow_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      const u = localStorage.getItem(USER_KEY);
      if (t && u) {
        setAuthToken(t);
        setTokenState(t);
        setUser(JSON.parse(u));
      }
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = useCallback((t, u) => {
    setAuthToken(t);
    setTokenState(t);
    setUser(u);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (body) => {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const { data } = await api.post("/auth/register", body, isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined);
    persist(data.token, data.user);
    return data.user;
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      persist(token, data.user);
    } catch {
      logout();
    }
  }, [token, persist, logout]);

  const updateLocalUser = useCallback(
    (partial) => {
      if (!user) return;
      const next = { ...user, ...partial };
      setUser(next);
      localStorage.setItem(USER_KEY, JSON.stringify(next));
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === "admin",
      isEmployer: user?.role === "employer",
      isStudent: user?.role === "student",
      isVerified: Boolean(user?.isVerified),
      hasRole: (role) => user?.role === role,
      login,
      register,
      logout,
      refreshUser,
      updateLocalUser,
    }),
    [user, token, loading, refreshUser, updateLocalUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function getRoleHomePath(role) {
  if (role === "admin") return "/admin";
  if (role === "employer") return "/employer/dashboard";
  return "/dashboard";
}
