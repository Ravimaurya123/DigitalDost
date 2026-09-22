"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError("Invalid or missing reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage(data.message);

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-3xl">
              🔐
            </div>

            <h1 className="text-2xl font-bold text-white">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Create a new password for your DigitalDost account.
            </p>
          </div>

          {/* Invalid Token */}
          {!token ? (
            <div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-center text-sm text-red-300">
                Invalid or missing password reset link.
              </div>

              <button
                onClick={() => router.push("/forgot-password")}
                className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Request New Link
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* New Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Minimum 6 characters.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-slate-400 hover:text-white"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Success */}
              {message && (
                <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-300">
                  {message}
                  <p className="mt-1 text-xs text-green-400">
                    Redirecting to login...
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>

              {/* Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-sm text-cyan-400 transition hover:text-cyan-300"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="text-cyan-400">
            Loading reset page...
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}