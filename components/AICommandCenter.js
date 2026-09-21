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

  const [confirmation, setConfirmation] = useState(null);

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
      // CONFIRMATION REQUIRED
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

          /*
          Show the confirmation box.
          Do not execute the delete yet.
          */

          setResults([]);

          return;
        }
      }

      // ========================================
      // OLD BACKWARD COMPATIBILITY
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
            data.confirmationToken ||
            "",
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
      // MULTI-ACTION RESULTS
      // ========================================

      if (
        Array.isArray(data.results)
      ) {
        setResults(data.results);
      } else {
        setResults([]);
      }

      /*
      Clear command only after successful
      execution.
      */

      setCommand("");

      /*
      Refresh dashboard so newly created,
      updated or deleted data appears.
      */

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
      false,
      ""
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

    /*
    IMPORTANT:

    We send the exact confirmation token
    returned by the server.

    Gemini is NOT called again for the
    delete operation.
    */

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
  // EXAMPLE
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
  // RESULT ACTION NAME
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
    if (!date) return "";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-5">

        <p className="text-cyan-400 text-sm font-medium">
          🤖 DigitalDost AI Command Center
        </p>

        <h2 className="text-2xl font-bold mt-2">
          Tell DigitalDost what to do
        </h2>

        <p className="text-slate-400 mt-2">
          Create, update, complete, delete
          and search your tasks, reminders
          and notes using natural language.
        </p>

        <p className="text-slate-500 text-sm mt-2">
          💡 You can also give multiple commands
          in one sentence.
        </p>

      </div>

      {/* ======================================
          COMMAND FORM
      ====================================== */}

      <form onSubmit={handleCommand}>

        <div className="flex flex-col md:flex-row gap-3">

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
            placeholder="Example: Create a Java task tomorrow and remind me at 7 PM"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "🤖 Processing..."
              : "⚡ Execute"}
          </button>

        </div>

      </form>

      {/* ======================================
          EXAMPLES
      ====================================== */}

      <div className="mt-4">

        <p className="text-slate-500 text-xs mb-2">
          Try an example:
        </p>

        <div className="flex flex-wrap gap-2">

          {/* TASK */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Add a task to complete DSA today"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            Add DSA task
          </button>

          {/* REMINDER */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Remind me to study Java tomorrow at 10 AM"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            Java reminder
          </button>

          {/* NOTE */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Create a note about my DigitalDost project"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            DigitalDost note
          </button>

          {/* COMPLETE */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Complete my DSA task"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            Complete task
          </button>

          {/* SEARCH */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Show my tasks"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            Show tasks
          </button>

          {/* DELETE */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Delete my DSA task"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-400 px-3 py-2 rounded-lg transition"
          >
            Delete task
          </button>

          {/* MULTI ACTION */}

          <button
            type="button"
            onClick={() =>
              useExample(
                "Create a task to study Java tomorrow and remind me at 7 PM"
              )
            }
            className="text-xs bg-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            ⚡ Multi Action
          </button>

        </div>

      </div>

      {/* ======================================
          CONFIRMATION BOX
      ====================================== */}

      {confirmation && (
        <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-xl p-5">

          <p className="text-red-400 font-semibold">
            ⚠️ Confirmation Required
          </p>

          <p className="text-slate-300 text-sm mt-2">
            {confirmation.message}
          </p>

          <p className="text-slate-500 text-xs mt-2">
            This confirmation is valid for 5 minutes.
          </p>

          <div className="flex gap-3 mt-4">

            <button
              type="button"
              onClick={confirmDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-400 text-white font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading
                ? "Deleting..."
                : "Confirm Delete"}
            </button>

            <button
              type="button"
              onClick={cancelDelete}
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {/* ======================================
          SUCCESS MESSAGE
      ====================================== */}

      {message && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">

          <p className="text-green-400 text-sm">
            ✅ {message}
          </p>

        </div>
      )}

      {/* ======================================
          ERROR MESSAGE
      ====================================== */}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">

          <p className="text-red-400 text-sm">
            ❌ {error}
          </p>

        </div>
      )}

      {/* ======================================
          MULTI-ACTION RESULTS
      ====================================== */}

      {results.length > 0 && (
        <div className="mt-5">

          <div className="flex items-center justify-between mb-3">

            <p className="text-slate-300 text-sm font-semibold">
              ⚡ Command Results
            </p>

            <span className="text-xs text-slate-500">
              {results.length} action
              {results.length > 1
                ? "s"
                : ""}
            </span>

          </div>

          <div className="space-y-3">

            {results.map(
              (result, index) => (
                <div
                  key={`${result.action}-${index}`}
                  className={`rounded-xl p-4 border ${
                    result.success
                      ? "bg-green-500/5 border-green-500/20"
                      : result.requiresConfirmation
                      ? "bg-yellow-500/5 border-yellow-500/20"
                      : "bg-red-500/5 border-red-500/20"
                  }`}
                >

                  <div className="flex items-start gap-3">

                    <div className="text-xl">
                      {getActionIcon(
                        result.action
                      )}
                    </div>

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <span className="text-xs font-medium text-cyan-400">
                          {getActionName(
                            result.action
                          )}
                        </span>

                        <span
                          className={`text-xs ${
                            result.success
                              ? "text-green-400"
                              : result.requiresConfirmation
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {result.success
                            ? "Success"
                            : result.requiresConfirmation
                            ? "Confirmation Required"
                            : "Failed"}
                        </span>

                      </div>

                      <p className="text-slate-300 text-sm mt-1">
                        {result.message}
                      </p>

                      {/* TASK DETAILS */}

                      {result.task && (
                        <div className="mt-3 text-xs text-slate-500 space-y-1">

                          <p>
                            📌 Title:{" "}
                            {result.task.title}
                          </p>

                          {result.task.priority && (
                            <p>
                              🎯 Priority:{" "}
                              {
                                result.task
                                  .priority
                              }
                            </p>
                          )}

                          {result.task.dueDate && (
                            <p>
                              📅 Due:{" "}
                              {formatDate(
                                result.task
                                  .dueDate
                              )}
                            </p>
                          )}

                        </div>
                      )}

                      {/* REMINDER DETAILS */}

                      {result.reminder && (
                        <div className="mt-3 text-xs text-slate-500 space-y-1">

                          <p>
                            🔔 Title:{" "}
                            {
                              result.reminder
                                .title
                            }
                          </p>

                          {result.reminder
                            .reminderDate && (
                            <p>
                              📅 Reminder:{" "}
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
                        <div className="mt-3 text-xs text-slate-500">

                          <p>
                            📝 Title:{" "}
                            {result.note.title}
                          </p>

                          {result.note.content && (
                            <p className="mt-1 whitespace-pre-wrap">
                              {result.note.content}
                            </p>
                          )}

                        </div>
                      )}

                      {/* SEARCH RESULTS */}

                      {Array.isArray(
                        result.results
                      ) && (
                        <div className="mt-3 space-y-2">

                          {result.results.length ===
                          0 ? (
                            <p className="text-xs text-slate-500">
                              No matching results
                              found.
                            </p>
                          ) : (
                            result.results.map(
                              (item) => (
                                <div
                                  key={
                                    item._id
                                  }
                                  className="bg-slate-900/70 border border-slate-700 rounded-lg p-3"
                                >

                                  <h4 className="text-white text-sm font-medium">
                                    {item.title}
                                  </h4>

                                  {item.description && (
                                    <p className="text-slate-400 text-xs mt-1">
                                      {
                                        item.description
                                      }
                                    </p>
                                  )}

                                  {item.content && (
                                    <p className="text-slate-400 text-xs mt-1 whitespace-pre-wrap">
                                      {
                                        item.content
                                      }
                                    </p>
                                  )}

                                  {item.priority && (
                                    <p className="text-xs text-cyan-400 mt-2">
                                      Priority:{" "}
                                      {
                                        item.priority
                                      }
                                    </p>
                                  )}

                                  {item.dueDate && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      Due:{" "}
                                      {formatDate(
                                        item.dueDate
                                      )}
                                    </p>
                                  )}

                                  {item.reminderDate && (
                                    <p className="text-xs text-slate-500 mt-1">
                                      Reminder:{" "}
                                      {formatDate(
                                        item.reminderDate
                                      )}
                                    </p>
                                  )}

                                  {typeof item.completed ===
                                    "boolean" && (
                                    <p className="text-xs mt-2">
                                      {item.completed
                                        ? "✅ Completed"
                                        : "⏳ Pending"}
                                    </p>
                                  )}

                                </div>
                              )
                            )
                          )}

                        </div>
                      )}

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}