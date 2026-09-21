"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tasks", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load tasks.");
        return;
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("LOAD TASKS ERROR:", error);
      setError("Something went wrong while loading tasks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: dueDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create task.");
        return;
      }

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setDueDate("");

      setSuccess("Task created successfully.");
      await loadTasks();
    } catch (error) {
      console.error("CREATE TASK ERROR:", error);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update task.");
        return;
      }

      await loadTasks();
    } catch (error) {
      console.error("TOGGLE TASK ERROR:", error);
      setError("Failed to update task.");
    }
  }

  async function deleteTask(task) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete task.");
        return;
      }

      setSuccess("Task deleted successfully.");
      await loadTasks();
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);
      setError("Failed to delete task.");
    }
  }

  function getPriorityClass(priority) {
    if (priority === "High") {
      return "border-red-400/20 bg-red-400/10 text-red-400";
    }

    if (priority === "Low") {
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";
    }

    return "border-yellow-400/20 bg-yellow-400/10 text-yellow-400";
  }

  function isOverdue(task) {
    if (!task.dueDate || task.completed) return false;

    return new Date(task.dueDate).getTime() < Date.now();
  }

  function formatDate(date) {
    if (!date) return "No due date";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "completed") return task.completed;

    if (filter === "pending") return !task.completed;

    if (filter === "high") return task.priority === "High";

    if (filter === "overdue") return isOverdue(task);

    return true;
  });

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.filter(
    (task) => !task.completed
  ).length;

  const overdueCount = tasks.filter(
    (task) => isOverdue(task)
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="text-2xl font-bold"
          >
            Digital<span className="text-cyan-400">Dost</span>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
            Productivity
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            My Tasks
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Create, manage and track your daily tasks from one place.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={tasks.length}
            icon="📋"
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
            label="Overdue"
            value={overdueCount}
            icon="⚠️"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          <section className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Create New Task
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add a task to your productivity list.
              </p>
            </div>

            <form
              onSubmit={addTask}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Task title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete DSA practice"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
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
                  placeholder="Add some details..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Due date
                </label>

                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Creating..." : "+ Create Task"}
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
                placeholder="🔍 Search tasks..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
              />

              <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["completed", "Completed"],
                  ["high", "High Priority"],
                  ["overdue", "Overdue"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm transition ${
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
              <LoadingState text="Loading tasks..." />
            ) : filteredTasks.length === 0 ? (
              <EmptyState
                icon="✅"
                title="No tasks found"
                text={
                  tasks.length === 0
                    ? "Create your first task to get started."
                    : "Try changing your search or filter."
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`rounded-2xl border p-4 transition sm:p-5 ${
                      task.completed
                        ? "border-emerald-500/10 bg-emerald-500/[0.03]"
                        : "border-white/10 bg-white/[0.04] hover:border-cyan-400/20"
                    }`}
                  >
                    <div className="flex gap-3 sm:gap-4">
                      <button
                        onClick={() =>
                          toggleTask(task)
                        }
                        className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                          task.completed
                            ? "border-emerald-400 bg-emerald-400 text-slate-950"
                            : "border-slate-600 hover:border-cyan-400"
                        }`}
                      >
                        {task.completed ? "✓" : ""}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <h3
                              className={`break-words font-semibold ${
                                task.completed
                                  ? "text-slate-500 line-through"
                                  : "text-white"
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="mt-1 break-words text-sm text-slate-400">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <span
                            className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getPriorityClass(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div
                            className={`text-xs ${
                              isOverdue(task)
                                ? "text-red-400"
                                : "text-slate-500"
                            }`}
                          >
                            📅 {formatDate(task.dueDate)}
                            {isOverdue(task) &&
                              " • Overdue"}
                          </div>

                          <button
                            onClick={() =>
                              deleteTask(task)
                            }
                            className="rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="mb-3 text-xl">{icon}</div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function LoadingState({ text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function EmptyState({ icon, title, text }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
      <div className="mb-4 text-4xl">{icon}</div>
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}