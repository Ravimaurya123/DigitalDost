"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AICommandCenter() {
  const router = useRouter();

  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [results, setResults] = useState([]);

  const [confirmation, setConfirmation] =
    useState(null);

  // ==========================================
  // EXECUTE COMMAND
  // ==========================================

  async function executeCommand(
    commandText,
    confirmed = false,
    confirmationToken = ""
  ) {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/ai-command",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            command: commandText,
            confirmed,
            confirmationToken,
          }),
        }
      );

      const data = await response.json();

      // ========================================
      // DELETE CONFIRMATION
      // ========================================

      if (
        response.ok &&
        Array.isArray(data.results)
      ) {
        const confirmationResult =
          data.results.find(
            (item) =>
              item.requiresConfirmation === true
          );

        if (confirmationResult) {
          setConfirmation({
            command: commandText,

            message:
              confirmationResult.confirmationMessage ||
              "Are you sure you want to continue?",

            token:
              confirmationResult.confirmationToken ||
              "",
          });

          setResults([]);

          return;
        }
      }

      // ========================================
      // OLD CONFIRMATION SUPPORT
      // ========================================

      if (
        response.ok &&
        data.requiresConfirmation
      ) {
        setConfirmation({
          command: commandText,

          message:
            data.confirmationMessage ||
            "Are you sure you want to continue?",

          token:
            data.confirmationToken || "",
        });

        return;
      }

      // ========================================
      // ERROR
      // ========================================

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to process command."
        );

        return;
      }

      // ========================================
      // SUCCESS
      // ========================================

      setMessage(
        data.message ||
          "Command completed successfully."
      );

      setConfirmation(null);

      // ========================================
      // RESULTS
      // ========================================

      if (Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
      }

      setCommand("");

      // Refresh dashboard data
      router.refresh();
    } catch (error) {
      console.error(
        "AI COMMAND ERROR:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  async function handleCommand(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setResults([]);

    if (!command.trim()) {
      setError(
        "Please enter a command."
      );

      return;
    }

    await executeCommand(
      command.trim(),
      false
    );
  }

  // ==========================================
  // CONFIRM DELETE
  // ==========================================

  async function confirmDelete() {
    if (!confirmation) {
      return;
    }

    if (!confirmation.token) {
      setError(
        "Delete confirmation expired. Please try the delete command again."
      );

      setConfirmation(null);

      return;
    }

    await executeCommand(
      confirmation.command,
      true,
      confirmation.token
    );
  }

  // ==========================================
  // CANCEL DELETE
  // ==========================================

  function cancelDelete() {
    setConfirmation(null);

    setMessage(
      "Delete action cancelled."
    );
  }

  // ==========================================
  // USE EXAMPLE
  // ==========================================

  function useExample(text) {
    setCommand(text);

    setMessage("");
    setError("");
    setResults([]);
    setConfirmation(null);
  }

  // ==========================================
  // RESULT ICON
  // ==========================================

  function getActionIcon(action) {
    if (action === "create_task") {
      return "✅";
    }

    if (action === "create_reminder") {
      return "🔔";
    }

    if (action === "create_note") {
      return "📝";
    }

    if (action === "update_task") {
      return "✏️";
    }

    if (action === "update_reminder") {
      return "⏰";
    }

    if (action === "update_note") {
      return "📝";
    }

    if (action === "complete_task") {
      return "☑️";
    }

    if (action === "complete_reminder") {
      return "🔔";
    }

    if (action === "delete_task") {
      return "🗑️";
    }

    if (action === "delete_reminder") {
      return "🗑️";
    }

    if (action === "delete_note") {
      return "🗑️";
    }

    if (action === "search_tasks") {
      return "🔎";
    }

    if (action === "search_reminders") {
      return "🔎";
    }

    if (action === "search_notes") {
      return "🔎";
    }

    return "🤖";
  }

  // ==========================================
  // ACTION NAME
  // ==========================================

  function getActionName(action) {
    if (!action) {
      return "AI Action";
    }

    return action
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  // ==========================================
  // EXAMPLES
  // ==========================================

  const examples = [
    "Create a task to practice Java tomorrow",
    "Remind me to call Mom at 7 PM today",
    "Create a note called DSA with binary search topics",
    "Complete my Java task",
    "Search my tasks for Java",
    "Delete my old task",
  ];

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-slate-900 p-4 shadow-xl shadow-cyan-950/10 sm:p-6">

      {/* ====================================== */}
      {/* DECORATIVE BACKGROUND */}
      {/* ====================================== */}

      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative">

        {/* ====================================== */}
        {/* HEADER */}
        {/* ====================================== */}

        <div className="mb-6">

          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-xl">
              🤖
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                AI Command Center
              </p>

              <p className="text-xs text-slate-500">
                DigitalDost Intelligence
              </p>
            </div>

          </div>

          <h2 className="text-2xl font-bold sm:text-3xl">
            Tell DigitalDost what to do
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Create, update, complete, delete and
            search your tasks, reminders and notes
            using natural language.
          </p>

          <div className="mt-3 inline-flex max-w-full items-start gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 px-3 py-2 text-xs text-slate-400 sm:text-sm">
            <span>💡</span>

            <span>
              You can give multiple commands in
              one sentence.
            </span>
          </div>

        </div>

        {/* ====================================== */}
        {/* COMMAND FORM */}
        {/* ====================================== */}

        <form onSubmit={handleCommand}>

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                ✨
              </span>

              <input
                type="text"
                value={command}
                onChange={(event) => {
                  setCommand(
                    event.target.value
                  );

                  setMessage("");
                  setError("");
                  setConfirmation(null);
                }}
                placeholder="Example: Create a task to practice Java tomorrow"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 sm:text-base"
                disabled={loading}
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex min-h-[50px] items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />

                  <span>
                    Processing...
                  </span>
                </>
              ) : (
                <>
                  <span>⚡</span>

                  <span>
                    Execute
                  </span>
                </>
              )}
            </button>

          </div>

        </form>

        {/* ====================================== */}
        {/* EXAMPLES */}
        {/* ====================================== */}

        <div className="mt-4">

          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
            Try an example
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2">

            {examples.map(
              (example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    useExample(example)
                  }
                  disabled={loading}
                  className="shrink-0 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {example}
                </button>
              )
            )}

          </div>

        </div>

        {/* ====================================== */}
        {/* SUCCESS MESSAGE */}
        {/* ====================================== */}

        {message && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-400">
                Done
              </p>

              <p className="mt-1 break-words text-sm text-emerald-300/80">
                {message}
              </p>
            </div>

          </div>
        )}

        {/* ====================================== */}
        {/* ERROR MESSAGE */}
        {/* ====================================== */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              !
            </div>

            <div>
              <p className="text-sm font-semibold text-red-400">
                Something went wrong
              </p>

              <p className="mt-1 break-words text-sm text-red-300/80">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ====================================== */}
        {/* DELETE CONFIRMATION */}
        {/* ====================================== */}

        {confirmation && (
          <div className="mt-5 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-4 sm:p-5">

            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10 text-xl">
                ⚠️
              </div>

              <div className="min-w-0">

                <h3 className="font-semibold text-yellow-400">
                  Confirm Delete
                </h3>

                <p className="mt-1 break-words text-sm leading-6 text-slate-300">
                  {confirmation.message}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  This confirmation is valid for
                  5 minutes.
                </p>

              </div>

            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={cancelDelete}
                disabled={loading}
                className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Deleting..."
                  : "Confirm Delete"}
              </button>

            </div>

          </div>
        )}

        {/* ====================================== */}
        {/* RESULTS */}
        {/* ====================================== */}

        {results.length > 0 && (
          <div className="mt-6">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Command Results
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  {results.length} action
                  {results.length !== 1
                    ? "s"
                    : ""}{" "}
                  processed
                </h3>
              </div>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-400">
                {results.length}
              </span>

            </div>

            <div className="space-y-3">

              {results.map(
                (result, index) => {

                  const success =
                    result.success !== false;

                  return (
                    <div
                      key={
                        result._id ||
                        index
                      }
                      className={`rounded-2xl border p-4 transition ${
                        success
                          ? "border-slate-700 bg-slate-900/70"
                          : "border-red-500/20 bg-red-500/5"
                      }`}
                    >

                      <div className="flex items-start gap-3">

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                            success
                              ? "bg-cyan-400/10"
                              : "bg-red-500/10"
                          }`}
                        >
                          {success
                            ? getActionIcon(
                                result.action
                              )
                            : "✕"}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                              {getActionName(
                                result.action
                              )}
                            </span>

                            <span
                              className={`text-xs ${
                                success
                                  ? "text-emerald-400"
                                  : "text-red-400"
                              }`}
                            >
                              {success
                                ? "Success"
                                : "Failed"}
                            </span>

                          </div>

                          {result.message && (
                            <p className="mt-2 break-words text-sm leading-6 text-slate-300">
                              {result.message}
                            </p>
                          )}

                          {/* TASK DETAILS */}

                          {result.task && (
                            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">

                              <p className="font-medium text-white">
                                {result.task.title}
                              </p>

                              {result.task.description && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    result.task
                                      .description
                                  }
                                </p>
                              )}

                              <div className="mt-2 flex flex-wrap gap-2">

                                {result.task
                                  .priority && (
                                  <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-400">
                                    Priority:{" "}
                                    {
                                      result
                                        .task
                                        .priority
                                    }
                                  </span>
                                )}

                                {result.task
                                  .dueDate && (
                                  <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">
                                    Due:{" "}
                                    {formatDate(
                                      result.task
                                        .dueDate
                                    )}
                                  </span>
                                )}

                              </div>

                            </div>
                          )}

                          {/* REMINDER DETAILS */}

                          {result.reminder && (
                            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">

                              <p className="font-medium text-white">
                                {result.reminder.title}
                              </p>

                              {result.reminder
                                .description && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    result
                                      .reminder
                                      .description
                                  }
                                </p>
                              )}

                              {result.reminder
                                .reminderDate && (
                                <p className="mt-2 text-xs text-cyan-400">
                                  🔔{" "}
                                  {formatDate(
                                    result
                                      .reminder
                                      .reminderDate
                                  )}
                                </p>
                              )}

                            </div>
                          )}

                          {/* NOTE DETAILS */}

                          {result.note && (
                            <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">

                              <p className="font-medium text-white">
                                {result.note.title}
                              </p>

                              {result.note
                                .content && (
                                <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-400">
                                  {
                                    result.note
                                      .content
                                  }
                                </p>
                              )}

                            </div>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}