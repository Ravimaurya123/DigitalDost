"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendarData() {
      try {
        setLoading(true);

        const [tasksResponse, remindersResponse] = await Promise.all([
          fetch("/api/tasks", { cache: "no-store" }),
          fetch("/api/reminders", { cache: "no-store" }),
        ]);

        const tasksData = await tasksResponse.json();
        const remindersData = await remindersResponse.json();

        if (tasksResponse.ok && tasksData.success) {
          setTasks(tasksData.tasks || []);
        }

        if (remindersResponse.ok && remindersData.success) {
          setReminders(remindersData.reminders || []);
        }
      } catch (error) {
        console.error("CALENDAR ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCalendarData();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("en-US", {
    month: "long",
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  function getDateKey(day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  }

  function getTaskDate(task) {
    const value = task.dueDate || task.date || task.createdAt;

    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getReminderDate(reminder) {
    const value =
      reminder.reminderDate || reminder.date || reminder.createdAt;

    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function getItemsForDay(day) {
    if (!day) {
      return {
        tasks: [],
        reminders: [],
      };
    }

    const key = getDateKey(day);

    return {
      tasks: tasks.filter((task) => getTaskDate(task) === key),
      reminders: reminders.filter(
        (reminder) => getReminderDate(reminder) === key
      ),
    };
  }

  function isToday(day) {
    if (!day) return false;

    const now = new Date();

    return (
      now.getFullYear() === year &&
      now.getMonth() === month &&
      now.getDate() === day
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}

        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 transition hover:text-cyan-400"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">
                Calendar 📅
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View your tasks and reminders by date.
              </p>
            </div>

            <button
              type="button"
              onClick={goToday}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              Today
            </button>
          </div>
        </div>

        {/* Calendar */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          {/* Calendar Header */}

          <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5">
            <button
              type="button"
              onClick={previousMonth}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              ←
            </button>

            <h2 className="text-lg font-bold sm:text-xl">
              {monthName} {year}
            </h2>

            <button
              type="button"
              onClick={nextMonth}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
            >
              →
            </button>
          </div>

          {/* Weekdays */}

          <div className="grid grid-cols-7 border-b border-slate-800">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map((day) => (
              <div
                key={day}
                className="border-r border-slate-800 px-1 py-3 text-center text-[10px] font-semibold uppercase text-slate-500 last:border-r-0 sm:text-xs"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}

          {loading ? (
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, index) => (
                <div
                  key={index}
                  className="min-h-[100px] border-b border-r border-slate-800 p-2 sm:min-h-[135px]"
                >
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const items = getItemsForDay(day);

                const hasTasks = items.tasks.length > 0;
                const hasReminders = items.reminders.length > 0;

                return (
                  <div
                    key={index}
                    className={`min-h-[105px] border-b border-r border-slate-800 p-1.5 sm:min-h-[135px] sm:p-2 ${
                      day
                        ? "bg-slate-950/30"
                        : "bg-slate-950/70"
                    }`}
                  >
                    {day && (
                      <>
                        {/* Date */}

                        <div
                          className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            isToday(day)
                              ? "bg-cyan-400 text-slate-950"
                              : "text-slate-400"
                          }`}
                        >
                          {day}
                        </div>

                        <div className="space-y-1">
                          {/* Tasks */}

                          {items.tasks.slice(0, 3).map((task) => (
                            <div
                              key={`task-${task._id}`}
                              className="truncate rounded-md border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-1 text-[9px] text-cyan-400 sm:text-[10px]"
                              title={task.title}
                            >
                              ✅ {task.title}
                            </div>
                          ))}

                          {/* Reminders */}

                          {items.reminders.slice(0, 3).map((reminder) => (
                            <div
                              key={`reminder-${reminder._id}`}
                              className="truncate rounded-md border border-amber-500/20 bg-amber-500/10 px-1.5 py-1 text-[9px] text-amber-400 sm:text-[10px]"
                              title={reminder.title}
                            >
                              🔔 {reminder.title}
                            </div>
                          ))}

                          {/* More Items */}

                          {items.tasks.length + items.reminders.length > 6 && (
                            <p className="text-[9px] text-slate-600">
                              +
                              {items.tasks.length +
                                items.reminders.length -
                                6}{" "}
                              more
                            </p>
                          )}

                          {/* Empty Day */}

                          {!hasTasks && !hasReminders && (
                            <div className="hidden text-[9px] text-slate-700 sm:block">
                              —
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Legend */}

        <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-cyan-400" />
            Tasks
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-amber-400" />
            Reminders
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400" />
            Today
          </div>
        </div>
      </div>
    </main>
  );
}