"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to process request."
        );
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error(
        "FORGOT PASSWORD FRONTEND ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyan-400">
            DigitalDost
          </h1>

          <p className="mt-2 text-slate-400">
            Reset your password 🔐
          </p>
        </div>

        <div className="dd-card rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <h2 className="text-2xl font-bold">
            Forgot Password?
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter your registered email and we'll
            send you a password reset link.
          </p>

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your registered email"
                autoComplete="email"
                required
                className="dd-input w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="dd-button w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Remember your password?{" "}

            <Link
              href="/login"
              className="dd-link font-semibold text-cyan-400"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}