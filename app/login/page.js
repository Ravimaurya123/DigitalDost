"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("LOGIN FRONTEND ERROR:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="dd-link inline-block text-3xl font-bold text-cyan-400">
            DigitalDost
          </h1>

          <p className="mt-2 text-slate-400">
            Welcome back 👋
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="dd-card rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <h2 className="text-2xl font-bold">
            Login
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Login to continue to your DigitalDost account.
          </p>

          {/* ERROR */}
          {error && (
            <div className="dd-card mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-6 space-y-5"
          >

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="dd-input w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="dd-link text-xs font-semibold text-cyan-400"
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="dd-input w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-14 text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 transition hover:text-cyan-400"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="dd-button w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          {/* REGISTER */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}

            <Link
              href="/register"
              className="dd-link font-semibold text-cyan-400"
            >
              Register
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}