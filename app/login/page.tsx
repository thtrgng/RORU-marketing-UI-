"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("Incorrect username or password.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-roru-bg">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-roru-text tracking-tight">
            RORU Marketing
          </h1>
          <p className="mt-1 text-sm text-roru-muted">Sign in to continue</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-roru-surface border border-roru-border rounded-xl p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-roru-text mb-1"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-roru-bg border border-roru-border rounded-lg px-3 py-2 text-sm text-roru-text placeholder-roru-muted focus:outline-none focus:border-roru-accent transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-roru-text mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-roru-bg border border-roru-border rounded-lg px-3 py-2 text-sm text-roru-text placeholder-roru-muted focus:outline-none focus:border-roru-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-roru-accent hover:bg-roru-accent-light disabled:opacity-50 text-white font-medium rounded-lg py-2 text-sm transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
