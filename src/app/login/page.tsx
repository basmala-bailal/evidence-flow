"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: "applicant" | "caseworker") => {
    if (type === "applicant") {
      setEmail("applicant@demo.com");
      setPassword("demo1234");
    } else {
      setEmail("caseworker@demo.com");
      setPassword("demo1234");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      {/* Header */}
      <header className="px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Evidence<span className="text-primary">Flow</span>
          </span>
        </Link>
      </header>

      {/* Card */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
            <h1 className="text-2xl font-bold mb-1">Welcome back</h1>
            <p className="text-muted text-sm mb-8">
              Sign in to continue to your applications.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary-dark transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-dark disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Demo shortcuts */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemo("applicant")}
                className="w-full py-2.5 text-sm font-medium text-foreground bg-surface hover:bg-primary-light/50 border border-border rounded-lg transition-colors"
              >
                Demo: Applicant account
              </button>
              <button
                type="button"
                onClick={() => fillDemo("caseworker")}
                className="w-full py-2.5 text-sm font-medium text-foreground bg-surface hover:bg-primary-light/50 border border-border rounded-lg transition-colors"
              >
                Demo: Caseworker account
              </button>
            </div>

            {/* Sign-up link */}
            <p className="text-sm text-center text-muted mt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:text-primary-dark transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Footer note */}
          <p className="text-xs text-center text-muted mt-6">
            Hackathon prototype · Synthetic exercise data only
          </p>
        </div>
      </main>
    </div>
  );
}
