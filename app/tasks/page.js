"use client";

import { useEffect, useState } from "react";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  async function fetchTasks() {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to fetch tasks");
        return;
      }

      setTasks(data.tasks || []);
    } catch (error) {
      console.error("FETCH TASKS ERROR:", error);
      setMessage("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to create task");
        return;
      }

      setMessage("Task created successfully! 🎉");

      setForm({
        title: "",
        description: "",
        priority: "Medium",
        dueDate: "",
      });

      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error("CREATE TASK ERROR:", error);
      setMessage("Something went wrong");
    }
  }

  // COMPLETE / PENDING TASK
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
        setMessage(data.message || "Failed to update task");
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item._id === task._id ? data.task : item
        )
      );

      setMessage(
        data.task.completed
          ? "Task completed successfully! 🎉"
          : "Task marked as pending."
      );
    } catch (error) {
      console.error("UPDATE TASK ERROR:", error);
      setMessage("Failed to update task");
    }
  }

  // DELETE TASK
  async function deleteTask(taskId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to delete task");
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task._id !== taskId)
      );

      setMessage("Task deleted successfully.");
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);
      setMessage("Failed to delete task");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-cyan-400">
              DIGITALDOST
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              My Tasks
            </h1>

            <p className="mt-2 text-slate-400">
              Manage your tasks and stay productive.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {showForm ? "Close" : "+ Add Task"}
          </button>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-cyan-400">
            {message}
          </div>
        )}

        {/* CREATE TASK FORM */}
        {showForm && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">
              Create New Task
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Task Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Example: Complete DBMS Assignment"
                  required
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write task details..."
                  rows="4"
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-400"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Due Date
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Create Task
              </button>
            </form>
          </div>
        )}

        {/* TASK LIST */}
        <div className="mt-8">

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              All Tasks
            </h2>

            <span className="text-sm text-slate-500">
              {tasks.length} task
              {tasks.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading tasks...
            </div>
          )}

          {/* EMPTY */}
          {!loading && tasks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">

              <div className="text-4xl">
                📋
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No tasks yet
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Create your first task to get started.
              </p>

            </div>
          )}

          {/* TASKS */}
          {!loading && tasks.length > 0 && (
            <div className="space-y-4">

              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`rounded-2xl border bg-slate-900 p-5 transition ${
                    task.completed
                      ? "border-green-500/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >

                  <div className="flex flex-col justify-between gap-5 sm:flex-row">

                    {/* TASK INFO */}
                    <div className="flex-1">

                      <h3
                        className={`text-lg font-semibold ${
                          task.completed
                            ? "text-slate-500 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="mt-2 text-sm text-slate-400">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">

                        {/* PRIORITY */}
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            task.priority === "High"
                              ? "bg-red-500/10 text-red-400"
                              : task.priority === "Low"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {task.priority}
                        </span>

                        {/* DATE */}
                        {task.dueDate && (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                            📅{" "}
                            {new Date(
                              task.dueDate
                            ).toLocaleDateString()}
                          </span>
                        )}

                        {/* STATUS */}
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            task.completed
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                          }`}
                        >
                          {task.completed
                            ? "Completed"
                            : "Pending"}
                        </span>

                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 sm:flex-col">

                      <button
                        onClick={() => toggleTask(task)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                          task.completed
                            ? "bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                            : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        }`}
                      >
                        {task.completed
                          ? "↩ Pending"
                          : "✓ Complete"}
                      </button>

                      <button
                        onClick={() => deleteTask(task._id)}
                        className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                      >
                        🗑 Delete
                      </button>

                    </div>

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