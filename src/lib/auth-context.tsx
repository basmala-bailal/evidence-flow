"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* ─── Types ─── */

export interface User {
  id: string;
  email: string;
  name: string;
  role: "applicant" | "caseworker";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* ─── Demo accounts ─── */

const DEMO_ACCOUNTS: Record<string, { password: string; user: User }> = {
  "applicant@demo.com": {
    password: "demo1234",
    user: {
      id: "user-1",
      email: "applicant@demo.com",
      name: "Anna Müller",
      role: "applicant",
    },
  },
  "caseworker@demo.com": {
    password: "demo1234",
    user: {
      id: "user-2",
      email: "caseworker@demo.com",
      name: "Marc Weber",
      role: "caseworker",
    },
  },
};

/* ─── Context ─── */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ef_user");
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem("ef_user", JSON.stringify(u));
    else localStorage.removeItem("ef_user");
  };

  const login = async (email: string, _password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));

    const entry = DEMO_ACCOUNTS[email.toLowerCase()];
    if (entry) {
      persist(entry.user);
      router.push(entry.user.role === "caseworker" ? "/caseworker" : "/dashboard");
      return;
    }

    // Allow any email for demo — create a temporary applicant user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name: email.split("@")[0],
      role: "applicant",
    };
    persist(newUser);
    router.push("/dashboard");
  };

  const signup = async (name: string, email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 600));

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role: "applicant",
    };
    persist(newUser);
    router.push("/dashboard");
  };

  const logout = () => {
    persist(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
