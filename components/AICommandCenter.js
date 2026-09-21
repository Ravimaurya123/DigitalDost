"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AICommandCenter() {
  const router = useRouter();

  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleCommand(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!command.trim()) {
      setError("Please enter a command.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/ai-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: command.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to process command.");
        return;
      }

      setMessage(data.message || "Command completed successfully.");

      setCommand("");

      router.refresh();
    } catch (error) {
      console.error("AI COMMAND ERROR:", error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function useExample(text) {
    setCommand(text);
    setMessage("");
    setError("");
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6 mb-8">

      {/* HEADER */}

      <div className="mb-5">

        <p className="text-cyan-400 text-sm font-medium">
          🤖 DigitalDost AI Command Center
        </p>

        <h2 className="text-2xl font-bold mt-2">
          Tell DigitalDost what to do
        </h2>

        <p className="text-slate-400 mt-2">
          Create tasks using natural language.
        </p>

      </div>

      {/* COMMAND FORM */}

      <form onSubmit={handleCommand}>

        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="text"
            value={command}
            onChange={(event) => {
              setCommand(event.target.value);
              setMessage("");
              setError("");
            }}
            placeholder="Example: Add a task to complete DSA today"
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "🤖 Processing..." : "⚡ Execute"}
          </button>

        </div>

      </form>

      {/* EXAMPLES */}

      <div className="mt-4">

        <p className="text-slate-500 text-xs mb-2">
          Try an example:
        </p>

        <div className="flex flex-wrap gap-2">

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

          <button
            type="button"
            onClick={() =>
              useExample(
                "Create a task to study Java tomorrow"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            Study Java
          </button>

          <button
            type="button"
            onClick={() =>
              useExample(
                "Add a task to practice LeetCode"
              )
            }
            className="text-xs bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 px-3 py-2 rounded-lg transition"
          >
            Practice LeetCode
          </button>

        </div>

      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-green-400 text-sm">
            ✅ {message}
          </p>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-sm">
            ❌ {error}
          </p>
        </div>
      )}

    </div>
  );
}