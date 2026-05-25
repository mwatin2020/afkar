"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi, clearToken, getStoredUser, getToken, setStoredUser, setToken, type User } from "@/lib/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  loginWithToken: (token: string, user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const cachedUser = getStoredUser();

    if (!token) {
      setLoading(false);
      return;
    }

    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    }

    authApi
      .me()
      .then((nextUser) => {
        setUser(nextUser);
        setStoredUser(nextUser);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithToken: (token, nextUser) => {
          setToken(token);
          setStoredUser(nextUser);
          setUser(nextUser);
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
            return;
          }
          router.push("/dashboard");
        },
        logout: () => {
          clearToken();
          setUser(null);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
            return;
          }
          router.push("/login");
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
