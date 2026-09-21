"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function AIHistoryPage() {
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

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
      console.error("LOAD AI HISTORY ERROR:", error);
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
      setError("");

      const response = await fetch("/api/ai-history", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to clear history.");
        return;
      }

      setCommands([]);
    } catch (error) {
      console.error("CLEAR HISTORY ERROR:", error);
      setError("Something went wrong.");
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
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function getStatusIcon(status) {
    if (status === "success") return "✓";
    if (status === "failed") return "✕";
    if (status === "cancelled") return "!";
    return "•";
  }

  function getStatusClass(status) {
    if (status === "success") {
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
    }

    if (status === "failed") {
      return "border-red-400/20 bg-red-400/10 text-red-400";
    }

    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
  }

  const filteredCommands = useMemo(() => {
    return commands.filter((item) => {
      const query = search.toLowerCase();

      const matchesSearch =
        item.command?.toLowerCase().includes(query) ||
        item.response?.toLowerCase().includes(query) ||
        item.action?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (filter === "success") {
        return item.status === "success";
      }

      if (filter === "failed") {
        return item.status === "failed";
      }

      if (filter === "cancelled") {
        return item.status === "cancelled";
      }

      return true;
    });
  }, [commands, search, filter]);

  const successCount = commands.filter(
    (item) => item.status === "success"
  ).length;

  const failedCount = commands.filter(
    (item) => item.status === "failed"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="dd-hover-icon flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">
              📜
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Digital<span className="text-cyan-400">Dost</span>
              </h1>

              <p className="text-xs text-slate-500">
                AI Command History
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="dd-button dd-link rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
              AI Activity
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Command History
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Review the commands and actions you have performed with
              DigitalDost AI.
            </p>
          </div>

          {commands.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={clearing}
              className="dd-button w-full rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {clearing ? "Clearing..." : "🗑 Clear History"}
            </button>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="dd-card mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon="🤖"
            label="Total Commands"
            value={commands.length}
          />

          <StatCard
            icon="✓"
            label="Successful"
            value={successCount}
          />

          <div className="dd-card col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-1">
            <div className="dd-hover-icon mb-3 text-xl">⚠️</div>

            <p className="text-xs text-slate-500">
              Failed
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {failedCount}
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="mb-6 space-y-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search AI commands..."
            className="dd-input w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
          />

          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              ["all", "All"],
              ["success", "Successful"],
              ["failed", "Failed"],
              ["cancelled", "Cancelled"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`dd-button whitespace-nowrap rounded-xl px-4 py-2 text-sm ${
                  filter === value
                    ? "bg-cyan-500 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <LoadingState text="Loading AI history..." />
        ) : filteredCommands.length === 0 ? (
          <EmptyState
            icon="🤖"
            title={
              commands.length === 0
                ? "No AI commands yet"
                : "No commands found"
            }
            text={
              commands.length === 0
                ? "Your AI commands will appear here after you use DigitalDost."
                : "Try changing your search or status filter."
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredCommands.map((item) => (
              <div
                key={item._id}
                className="dd-card rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <div
                    className={`dd-hover-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {getStatusIcon(item.status)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="dd-card rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400">
                            {getActionLabel(item.action)}
                          </span>

                          <span
                            className={`rounded-full border px-3 py-1 text-xs uppercase ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="break-words text-sm font-medium leading-6 text-white sm:text-base">
                          {item.command}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-600">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {item.response && (
                      <div className="dd-card mt-4 rounded-xl border border-white/5 bg-slate-950/50 p-3">
                        <p className="text-xs uppercase tracking-wider text-slate-600">
                          AI Response
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                          {item.response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="dd-card rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="dd-hover-icon mb-3 text-xl">
        {icon}
      </div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function LoadingState({ text }) {
  return (
    <div className="dd-card rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <div className="dd-hover-icon mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="dd-card rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
      <div className="dd-hover-icon mb-4 text-4xl">
        {icon}
      </div>

      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>

      <Link
        href="/assistant"
        className="dd-button dd-link mt-6 inline-block rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950"
      >
        Open AI Assistant
      </Link>
    </div>
  );
}