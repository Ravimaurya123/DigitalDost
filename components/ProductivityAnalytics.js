"use client";

import { useEffect, useState } from "react";

export default function ProductivityAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const response = await fetch("/api/analytics", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error("ANALYTICS FETCH ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <section className="dd-card rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="animate-pulse">
          <div className="h-5 w-48 rounded bg-slate-800" />
          <div className="mt-6 h-3 rounded bg-slate-800" />

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 rounded-xl bg-slate-800"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!analytics) {
    return null;
  }

  const stats = [
    {
      icon: "📋",
      label: "Total Tasks",
      value: analytics.totalTasks,
    },
    {
      icon: "✅",
      label: "Completed",
      value: analytics.completedTasks,
    },
    {
      icon: "⏳",
      label: "Pending",
      value: analytics.pendingTasks,
    },
    {
      icon: "🔔",
      label: "Reminders",
      value: analytics.totalReminders,
    },
    {
      icon: "📝",
      label: "Notes",
      value: analytics.totalNotes,
    },
    {
      icon: "📄",
      label: "Documents",
      value: analytics.totalDocuments,
    },
  ];

  return (
    <section className="mt-8">
      {/* Heading */}
      <div className="mb-4">
        <h2 className="dd-word-heading text-2xl font-bold text-white sm:text-3xl">
          <span className="dd-word">Productivity</span>{" "}
          <span className="dd-word">Analytics</span>{" "}
          <span className="dd-word">📊</span>
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Track your DigitalDost activity and productivity.
        </p>
      </div>

      {/* Completion Card */}
      <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">
              Task Completion
            </p>

            <div className="mt-1 flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {analytics.completionPercentage}%
              </span>

              <span className="pb-1 text-xs text-slate-500">
                completed
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-500">
              {analytics.completedTasks} of{" "}
              {analytics.totalTasks} tasks
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-cyan-400 transition-all duration-700"
            style={{
              width: `${analytics.completionPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="dd-feature rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md"
          >
            <div className="dd-hover-icon text-xl">
              {stat.icon}
            </div>

            <p className="mt-3 text-2xl font-bold text-white">
              {stat.value}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}