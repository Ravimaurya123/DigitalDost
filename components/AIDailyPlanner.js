"use client";

import { useState } from "react";

export default function AIDailyPlanner() {
  const [input, setInput] = useState("");
  const [plan, setPlan] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function generatePlan() {
    if (!input.trim()) {
      setError("Please describe what you want to plan.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setPlan(null);

      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: input.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate plan."
        );
      }

      setPlan(data.plan);
    } catch (error) {
      console.error("PLANNER ERROR:", error);

      setError(
        error.message || "Unable to generate plan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    if (!plan) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/planner/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save plan."
        );
      }

      setSuccess(
        `Plan saved successfully! ${data.created.tasks} task(s) and ${data.created.reminders} reminder(s) added.`
      );

      setPlan(null);
      setInput("");
    } catch (error) {
      console.error("SAVE PLAN ERROR:", error);

      setError(
        error.message || "Unable to save plan."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-8">
      {/* Heading */}

      <div className="mb-4">
        <h2 className="dd-word-heading text-2xl font-bold text-white sm:text-3xl">
          <span className="dd-word">AI</span>{" "}
          <span className="dd-word">Daily</span>{" "}
          <span className="dd-word">Planner</span>{" "}
          <span className="dd-word">🧠</span>
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Tell DigitalDost what you need to accomplish.
        </p>
      </div>

      {/* Input */}

      <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <textarea
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setError("");
            setSuccess("");
          }}
          placeholder="Example: Tomorrow I have an exam. I need to complete 3 chapters and revise everything at 9 PM."
          rows={4}
          maxLength={1000}
          className="dd-input w-full resize-none rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-white outline-none placeholder:text-slate-600"
        />

        <div className="mt-2 text-right text-xs text-slate-600">
          {input.length}/1000
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={generatePlan}
          disabled={loading || saving}
          className="dd-button mt-4 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Creating Plan..."
            : "Generate AI Plan ✨"}
        </button>
      </div>

      {/* Generated Plan */}

      {plan && (
        <div className="mt-5 space-y-4">
          {/* Plan Header */}

          <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {plan.title}
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  {plan.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={savePlan}
                disabled={saving}
                className="dd-button shrink-0 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Adding..."
                  : "Add All to DigitalDost 🚀"}
              </button>
            </div>
          </div>

          {/* Tasks */}

          {plan.tasks?.length > 0 && (
            <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Tasks
              </h3>

              <div className="space-y-3">
                {plan.tasks.map((task, index) => (
                  <div
                    key={index}
                    className="dd-feature rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminders */}

          {plan.reminders?.length > 0 && (
            <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Reminders
              </h3>

              <div className="space-y-3">
                {plan.reminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="dd-feature rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <p className="font-medium text-white">
                      🔔 {reminder.title}
                    </p>

                    {reminder.description && (
                      <p className="mt-1 text-sm text-slate-500">
                        {reminder.description}
                      </p>
                    )}

                    {(reminder.date ||
                      reminder.time) && (
                      <p className="mt-2 text-xs text-cyan-400">
                        {reminder.date ||
                          "Date not specified"}

                        {reminder.time
                          ? ` • ${reminder.time}`
                          : ""}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}