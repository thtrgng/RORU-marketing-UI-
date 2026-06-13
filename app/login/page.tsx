"use client";

import { useState, FormEvent } from "react";

export default function LoginPage() {
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
      window.location.href = "/";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-roru-bg">
      <div className="w-full max-w-[340px] px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-roru-accent mb-4">
            <span className="text-white text-base font-semibold leading-none">R</span>
          </div>
          <h1 className="text-xl font-semibold text-roru-text">
            RORU Marketing
          </h1>
          <p className="mt-1 text-sm text-roru-muted">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-roru-input-bg border border-roru-border rounded-xl px-4 py-3 text-sm text-roru-text placeholder-roru-muted focus:outline-none focus:border-roru-muted transition-colors"
          />
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-roru-input-bg border border-roru-border rounded-xl px-4 py-3 text-sm text-roru-text placeholder-roru-muted focus:outline-none focus:border-roru-muted transition-colors"
          />

          {error && (
            <p className="text-xs text-red-400 text-center pt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-roru-accent hover:bg-roru-accent-hover disabled:opacity-50 text-white font-medium rounded-xl py-3 text-sm transition-colors mt-1"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
