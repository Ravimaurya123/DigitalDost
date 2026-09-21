"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AIHistoryPage() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/ai-history", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load history.");
        return;
      }

      setCommands(data.commands || []);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function clearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to clear all AI command history?"
    );

    if (!confirmed) return;

    try {
      setClearing(true);

      const response = await fetch("/api/ai-history", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to clear history.");
        return;
      }

      setCommands([]);
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setClearing(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getActionLabel(action) {
    if (!action) return "AI Command";

    return action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function getStatusIcon(status) {
    if (status === "success") return "✓";
    if (status === "failed") return "✕";
    if (status === "cancelled") return "!";
    return "•";
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/dashboard"
            className="text-2xl font-bold"
          >
            Digital<span className="text-cyan-400">Dost</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-cyan-400">
              AI ACTIVITY
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              AI Command History
            </h1>

            <p className="mt-2 text-slate-400">
              View your previous DigitalDost AI commands and actions.
            </p>
          </div>

          {commands.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={clearing}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearing ? "Clearing..." : "Clear History"}
            </button>
          )}
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

            <p className="text-slate-400">
              Loading AI history...
            </p>
          </div>
        ) : commands.length === 0 ? (
          /* EMPTY STATE */

          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">
            <div className="mb-5 text-5xl">🤖</div>

            <h2 className="text-xl font-semibold">
              No AI commands yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-400">
              Your AI commands will appear here after you use the
              DigitalDost AI Command Center.
            </p>

            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          /* HISTORY */

          <div className="space-y-4">
            {commands.map((item) => (
              <div
                key={item._id}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-400/20 hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
                        item.status === "success"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.status === "failed"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {getStatusIcon(item.status)}
                    </div>

                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400">
                          {getActionLabel(item.action)}
                        </span>

                        <span className="text-xs text-slate-500">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      <p className="text-base font-medium text-white">
                        {item.command}
                      </p>

                      {item.response && (
                        <p className="mt-2 text-sm text-slate-400">
                          {item.response}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-medium uppercase ${
                      item.status === "success"
                        ? "text-emerald-400"
                        : item.status === "failed"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}