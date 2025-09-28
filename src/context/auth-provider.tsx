"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean | undefined;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const loggedIn = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(loggedIn);
    } catch (error) {
      // localStorage is not available on the server
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback((user: string, pass: string) => {
    if (user === "admin" && pass === "password") {
      localStorage.setItem("isAuthenticated", "true");
      setIsAuthenticated(true);
      router.push("/");
      return true;
    }
    return false;
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);
  
  useEffect(() => {
    if (isAuthenticated === false && pathname !== '/login') {
        router.push('/login');
    }
  }, [isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
