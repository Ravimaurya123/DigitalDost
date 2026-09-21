"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadReminders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/reminders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to load reminders."
        );
        return;
      }

      setReminders(data.reminders || []);
    } catch (error) {
      console.error("LOAD REMINDERS ERROR:", error);
      setError("Something went wrong while loading reminders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReminders();
  }, []);

  async function addReminder(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Reminder title is required.");
      return;
    }

    if (!reminderDate) {
      setError("Please select reminder date and time.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          reminderDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create reminder."
        );
        return;
      }

      setTitle("");
      setDescription("");
      setReminderDate("");

      setSuccess("Reminder created successfully.");
      await loadReminders();
    } catch (error) {
      console.error("CREATE REMINDER ERROR:", error);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleReminder(reminder) {
    try {
      const response = await fetch(
        `/api/reminders/${reminder._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completed: !reminder.completed,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to update reminder."
        );
        return;
      }

      await loadReminders();
    } catch (error) {
      console.error("TOGGLE REMINDER ERROR:", error);
      setError("Failed to update reminder.");
    }
  }

  async function deleteReminder(reminder) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${reminder.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/reminders/${reminder._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to delete reminder."
        );
        return;
      }

      setSuccess("Reminder deleted successfully.");
      await loadReminders();
    } catch (error) {
      console.error("DELETE REMINDER ERROR:", error);
      setError("Failed to delete reminder.");
    }
  }

  function isPast(reminder) {
    if (reminder.completed) return false;

    return (
      new Date(reminder.reminderDate).getTime() <
      Date.now()
    );
  }

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const filteredReminders = reminders.filter(
    (reminder) => {
      const matchesSearch =
        reminder.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        reminder.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === "pending") {
        return !reminder.completed;
      }

      if (filter === "completed") {
        return reminder.completed;
      }

      if (filter === "upcoming") {
        return (
          !reminder.completed &&
          new Date(reminder.reminderDate).getTime() >=
            Date.now()
        );
      }

      if (filter === "missed") {
        return isPast(reminder);
      }

      return true;
    }
  );

  const pendingCount = reminders.filter(
    (item) => !item.completed
  ).length;

  const completedCount = reminders.filter(
    (item) => item.completed
  ).length;

  const missedCount = reminders.filter(
    (item) => isPast(item)
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">

          <Link
            href="/dashboard"
            className="dd-link text-2xl font-bold"
          >
            Digital<span className="text-cyan-400">Dost</span>
          </Link>

          <Link
            href="/dashboard"
            className="dd-button rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Dashboard
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">

        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
            Smart Alerts
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            My Reminders
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Never miss an important task, event or activity.
          </p>
        </div>

        {error && (
          <div className="dd-card mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="dd-card mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <StatCard
            label="Total"
            value={reminders.length}
            icon="🔔"
          />

          <StatCard
            label="Pending"
            value={pendingCount}
            icon="⏳"
          />

          <StatCard
            label="Completed"
            value={completedCount}
            icon="✓"
          />

          <StatCard
            label="Missed"
            value={missedCount}
            icon="⚠️"
          />

        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">

          <section className="dd-card h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5">

            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Create Reminder
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Set a date and time for your reminder.
              </p>
            </div>

            <form
              onSubmit={addReminder}
              className="space-y-4"
            >

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Reminder title
                </label>

                <input
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  placeholder="e.g. Attend placement meeting"
                  className="dd-input w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Add reminder details..."
                  rows={4}
                  className="dd-input w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Reminder date & time
                </label>

                <input
                  type="datetime-local"
                  value={reminderDate}
                  onChange={(e) =>
                    setReminderDate(e.target.value)
                  }
                  className="dd-input w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="dd-button w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Creating..."
                  : "🔔 Create Reminder"}
              </button>

            </form>
          </section>

          <section>

            <div className="mb-5 flex flex-col gap-3">

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="🔍 Search reminders..."
                className="dd-input w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
              />

              <div className="flex gap-2 overflow-x-auto pb-1">

                {[
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["upcoming", "Upcoming"],
                  ["completed", "Completed"],
                  ["missed", "Missed"],
                ].map(([value, label]) => (

                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`dd-button whitespace-nowrap rounded-xl px-4 py-2 text-sm transition ${
                      filter === value
                        ? "bg-cyan-500 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {label}
                  </button>

                ))}

              </div>
            </div>

            {loading ? (
              <LoadingState text="Loading reminders..." />
            ) : filteredReminders.length === 0 ? (
              <EmptyState
                icon="🔔"
                title="No reminders found"
                text={
                  reminders.length === 0
                    ? "Create your first reminder to stay organized."
                    : "Try changing your search or filter."
                }
              />
            ) : (

              <div className="space-y-3">

                {filteredReminders.map(
                  (reminder) => (

                    <div
                      key={reminder._id}
                      className={`dd-card rounded-2xl border p-4 transition sm:p-5 ${
                        reminder.completed
                          ? "border-emerald-500/10 bg-emerald-500/[0.03]"
                          : isPast(reminder)
                          ? "border-red-500/20 bg-red-500/[0.04]"
                          : "border-white/10 bg-white/[0.04] hover:border-cyan-400/20"
                      }`}
                    >

                      <div className="flex gap-3 sm:gap-4">

                        <button
                          onClick={() =>
                            toggleReminder(reminder)
                          }
                          className={`dd-hover-icon mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                            reminder.completed
                              ? "border-emerald-400 bg-emerald-400 text-slate-950"
                              : "border-slate-600 hover:border-cyan-400"
                          }`}
                        >
                          {reminder.completed
                            ? "✓"
                            : ""}
                        </button>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">

                            <div>

                              <h3
                                className={`break-words font-semibold ${
                                  reminder.completed
                                    ? "text-slate-500 line-through"
                                    : "text-white"
                                }`}
                              >
                                {reminder.title}
                              </h3>

                              {reminder.description && (
                                <p className="mt-1 break-words text-sm text-slate-400">
                                  {reminder.description}
                                </p>
                              )}

                            </div>

                            <span
                              className={`dd-hover-icon w-fit rounded-full border px-3 py-1 text-xs ${
                                reminder.completed
                                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                                  : isPast(reminder)
                                  ? "border-red-400/20 bg-red-400/10 text-red-400"
                                  : "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                              }`}
                            >
                              {reminder.completed
                                ? "Completed"
                                : isPast(reminder)
                                ? "Missed"
                                : "Upcoming"}
                            </span>

                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

                            <div
                              className={`text-xs ${
                                isPast(reminder)
                                  ? "text-red-400"
                                  : "text-slate-500"
                              }`}
                            >
                              🕐{" "}
                              {formatDate(
                                reminder.reminderDate
                              )}
                            </div>

                            <button
                              onClick={() =>
                                deleteReminder(reminder)
                              }
                              className="dd-button rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                            >
                              Delete
                            </button>

                          </div>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, icon }) {
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

      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

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

      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
}