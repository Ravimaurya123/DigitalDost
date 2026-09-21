"use client";

import { useEffect, useState } from "react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch reminders
  async function fetchReminders() {
    try {
      const response = await fetch("/api/reminders");
      const data = await response.json();

      if (data.success) {
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error("FETCH REMINDERS ERROR:", error);
    }
  }

  useEffect(() => {
    fetchReminders();
  }, []);

  // Create reminder
  async function handleSubmit(e) {
    e.preventDefault();

    if (!title || !reminderDate) {
      setMessage("Please enter title and date/time.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          reminderDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create reminder.");
        return;
      }

      setMessage("Reminder created successfully! 🔔");

      setTitle("");
      setDescription("");
      setReminderDate("");

      fetchReminders();
    } catch (error) {
      console.error("CREATE REMINDER ERROR:", error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Format date
  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // Complete / Pending reminder
  async function toggleComplete(id, completed) {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !completed,
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchReminders();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("COMPLETE REMINDER ERROR:", error);
    }
  }

  // Delete reminder
  async function deleteReminder(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this reminder?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchReminders();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("DELETE REMINDER ERROR:", error);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Back to Dashboard
          </a>

          <h1 className="text-4xl font-bold mt-4">
            Smart Reminders 🔔
          </h1>

          <p className="text-slate-400 mt-2">
            Never forget your important tasks and activities.
          </p>
        </div>

        {/* Create Reminder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-5">
            Create New Reminder
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Title */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DSA Practice"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Practice Binary Search"
                rows="3"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Date & Time
              </label>

              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            {/* Create Button */}
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "+ Create Reminder"}
            </button>

            {/* Message */}
            {message && (
              <p className="text-sm text-cyan-400">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* Reminders List */}
        <div>
          <h2 className="text-2xl font-semibold mb-5">
            Upcoming Reminders
          </h2>

          {/* No Reminders */}
          {reminders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                No reminders yet.
              </p>

              <p className="text-slate-500 text-sm mt-2">
                Create your first reminder above.
              </p>
            </div>
          ) : (

            /* Reminder Cards */
            <div className="grid gap-4">
              {reminders.map((reminder) => (
                <div
                  key={reminder._id}
                  className={`bg-slate-900 border rounded-2xl p-5 ${
                    reminder.completed
                      ? "border-green-500/30 opacity-70"
                      : "border-slate-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    {/* Reminder Information */}
                    <div className="flex-1">

                      <h3
                        className={`text-lg font-semibold ${
                          reminder.completed
                            ? "line-through text-slate-500"
                            : "text-white"
                        }`}
                      >
                        🔔 {reminder.title}
                      </h3>

                      {reminder.description && (
                        <p className="text-slate-400 mt-2">
                          {reminder.description}
                        </p>
                      )}

                      <p className="text-cyan-400 text-sm mt-3">
                        📅 {formatDate(reminder.reminderDate)}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4">

                        {/* Complete Button */}
                        <button
                          onClick={() =>
                            toggleComplete(
                              reminder._id,
                              reminder.completed
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            reminder.completed
                              ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                              : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                          }`}
                        >
                          {reminder.completed
                            ? "↩ Mark Pending"
                            : "✓ Complete"}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            deleteReminder(reminder._id)
                          }
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          🗑 Delete
                        </button>

                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        reminder.completed
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {reminder.completed
                        ? "Completed"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}