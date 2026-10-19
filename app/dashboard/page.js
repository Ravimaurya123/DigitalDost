
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Note from "@/models/Note";
import Reminder from "@/models/Reminder";

import ReminderNotification from "@/components/ReminderNotification";
import AICommandCenter from "@/components/AICommandCenter";
import DashboardSidebar from "@/components/DashboardSidebar";
import Greeting from "@/components/Greeting";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

function StatCard({ label, value, subtitle, icon, accent }) {
  return (
    <div className="dd-card group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900 to-slate-950 p-4 sm:p-5">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${accent}`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400 sm:text-sm">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500 sm:text-sm">
            {subtitle}
          </p>
        </div>

        <div className="dd-hover-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-xl sm:h-12 sm:w-12">
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, description, icon, color }) {
  return (
    <div className="dd-card flex items-center justify-between gap-3 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-4 sm:p-5">
      <div className="min-w-0">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <div className="dd-hover-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
        {icon}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, href, linkLabel }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          {eyebrow}
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>

      <a
        href={href}
        className="dd-link mt-2 shrink-0 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300 sm:text-sm"
      >
        {linkLabel} →
      </a>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await connectDB();

  const tasks = await Task.find({
    userId: user.userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  const notes = await Note.find({
    userId: user.userId,
  })
    .sort({ createdAt: -1 })
    .lean();

  const reminders = await Reminder.find({
    userId: user.userId,
  })
    .sort({ reminderDate: 1 })
    .lean();

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  const pendingReminders = reminders.filter(
    (reminder) => !reminder.completed
  );

  const todayReminders = pendingReminders.filter(
    (reminder) => {
      const reminderDate = new Date(reminder.reminderDate);

      return (
        reminderDate >= startOfToday &&
        reminderDate < endOfToday
      );
    }
  );

  const upcomingReminders = pendingReminders.filter(
    (reminder) => {
      const reminderDate = new Date(reminder.reminderDate);

      return reminderDate >= endOfToday;
    }
  );

  const overdueReminders = pendingReminders.filter(
    (reminder) => {
      const reminderDate = new Date(reminder.reminderDate);

      return reminderDate < now;
    }
  );

  const dashboardReminders = [
    ...todayReminders,
    ...upcomingReminders,
  ].slice(0, 5);

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false;

    const dueDate = new Date(task.dueDate);

    return (
      dueDate >= startOfToday &&
      dueDate < endOfToday
    );
  });

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getReminderStatus(reminder) {
    const reminderDate = new Date(reminder.reminderDate);

    if (reminderDate < now) return "Overdue";

    if (
      reminderDate >= startOfToday &&
      reminderDate < endOfToday
    ) {
      return "Today";
    }

    return "Upcoming";
  }

  const completionRate =
    totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b18] text-white">
      <ReminderNotification />

      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-cyan-500/[0.07] blur-[120px]" />
        <div className="absolute -right-40 top-[35%] h-96 w-96 rounded-full bg-blue-600/[0.06] blur-[130px]" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#070b18]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[68px] items-center justify-between gap-3">
            <a
              href="/dashboard"
              className="dd-link flex shrink-0 items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-lg font-black text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                D
              </span>

              <span className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Digital<span className="text-cyan-400">Dost</span>
              </span>
            </a>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <NotificationBell />

              <div className="hidden border-l border-slate-800 pl-3 text-right sm:block">
                <p className="max-w-36 truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="max-w-36 truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              <div className="dd-hover-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 font-bold text-cyan-300 sm:h-10 sm:w-10">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main layout */}
      <div className="relative mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          <DashboardSidebar />

          <section className="min-w-0 flex-1">
            {/* Welcome section */}
            <div className="mb-7 rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-cyan-950/20 p-5 shadow-xl shadow-black/10 sm:mb-8 sm:p-7 lg:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-3 py-1.5 text-xs font-medium text-cyan-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                    YOUR PERSONAL WORKSPACE
                  </div>

                  <Greeting />

                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                    Your tasks, notes, reminders and AI assistant —
                    everything you need to stay organized in one place.
                  </p>
                </div>

                <a
                  href="/assistant"
                  className="dd-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition hover:bg-cyan-300 sm:self-center"
                >
                  <span>✧</span>
                  Open AI Assistant
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>

            {/* Statistics */}
            <div className="mb-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                    OVERVIEW
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Your productivity
                  </h2>
                </div>

                <p className="text-xs text-slate-500">
                  {completionRate}% tasks completed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard
                  label="Total Tasks"
                  value={totalTasks}
                  subtitle="All your tasks"
                  icon="▤"
                  accent="bg-blue-400/10"
                />

                <StatCard
                  label="Completed"
                  value={completedTasks}
                  subtitle="Tasks finished"
                  icon="✓"
                  accent="bg-emerald-400/10"
                />

                <StatCard
                  label="Pending"
                  value={pendingTasks}
                  subtitle="Still to complete"
                  icon="◷"
                  accent="bg-amber-400/10"
                />

                <StatCard
                  label="Reminders"
                  value={pendingReminders.length}
                  subtitle="Active reminders"
                  icon="♧"
                  accent="bg-cyan-400/10"
                />
              </div>
            </div>

            {/* Task completion progress */}
            <div className="dd-card mb-8 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Task completion
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Your overall task progress
                  </p>
                </div>

                <p className="text-2xl font-bold text-cyan-300">
                  {completionRate}%
                </p>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"
                role="progressbar"
                aria-label="Task completion progress"
                aria-valuenow={completionRate}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-slate-500">
                <span>{completedTasks} completed</span>
                <span>{pendingTasks} remaining</span>
              </div>
            </div>

            {/* Reminder overview */}
            <div className="mb-8">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  STAY ON TRACK
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                  Reminder overview
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <SummaryCard
                  label="Today"
                  value={todayReminders.length}
                  description="Scheduled for today"
                  icon="▦"
                  color="text-cyan-300"
                />

                <SummaryCard
                  label="Upcoming"
                  value={upcomingReminders.length}
                  description="Coming up next"
                  icon="◷"
                  color="text-emerald-300"
                />

                <SummaryCard
                  label="Overdue"
                  value={overdueReminders.length}
                  description="Past their scheduled time"
                  icon="⚠"
                  color="text-rose-400"
                />
              </div>
            </div>

            {/* AI command center */}
            <div className="mb-8">
              <AICommandCenter />
            </div>

            {/* Today's tasks and reminders */}
            <div className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
              {/* Tasks */}
              <div className="dd-card min-w-0 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 sm:p-6">
                <SectionHeading
                  eyebrow="YOUR SCHEDULE"
                  title="Today's Tasks"
                  description="Tasks scheduled for today"
                  href="/tasks"
                  linkLabel="View all"
                />

                {todayTasks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                      🎯
                    </div>
                    <p className="font-medium text-slate-200">
                      Nothing scheduled for today
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Add a task to plan your day.
                    </p>
                    <a
                      href="/tasks"
                      className="dd-button mt-4 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      + Create task
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.slice(0, 5).map((task) => (
                      <div
                        key={task._id.toString()}
                        className="dd-card rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                              task.completed
                                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                                : "border-slate-600 text-slate-500"
                            }`}
                            aria-hidden="true"
                          >
                            {task.completed ? "✓" : ""}
                          </span>

                          <div className="min-w-0 flex-1">
                            <h3
                              className={`break-words text-sm font-semibold ${
                                task.completed
                                  ? "text-slate-500 line-through"
                                  : "text-slate-100"
                              }`}
                            >
                              {task.title}
                            </h3>

                            {task.description && (
                              <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                                {task.description}
                              </p>
                            )}
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                              task.completed
                                ? "bg-emerald-400/10 text-emerald-300"
                                : "bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {task.completed ? "Done" : "Pending"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {todayTasks.length > 5 && (
                      <p className="pt-1 text-center text-xs text-slate-500">
                        +{todayTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Reminders */}
              <div className="dd-card min-w-0 rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 sm:p-6">
                <SectionHeading
                  eyebrow="DON'T FORGET"
                  title="Smart Reminders"
                  description="Today and upcoming reminders"
                  href="/reminders"
                  linkLabel="View all"
                />

                {dashboardReminders.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                      ♧
                    </div>
                    <p className="font-medium text-slate-200">
                      You're all caught up
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Create a reminder for something important.
                    </p>
                    <a
                      href="/reminders"
                      className="dd-button mt-4 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      + Create reminder
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardReminders.map((reminder) => {
                      const status = getReminderStatus(reminder);

                      const statusStyles =
                        status === "Overdue"
                          ? "border-rose-500/25 bg-rose-500/[0.04]"
                          : status === "Today"
                            ? "border-cyan-400/25 bg-cyan-400/[0.04]"
                            : "border-slate-800 bg-slate-950/50";

                      const badgeStyles =
                        status === "Overdue"
                          ? "bg-rose-400/10 text-rose-300"
                          : status === "Today"
                            ? "bg-cyan-400/10 text-cyan-300"
                            : "bg-emerald-400/10 text-emerald-300";

                      return (
                        <div
                          key={reminder._id.toString()}
                          className={`dd-card rounded-xl border p-4 ${statusStyles}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="break-words text-sm font-semibold text-slate-100">
                                {reminder.title}
                              </h3>

                              {reminder.description && (
                                <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                                  {reminder.description}
                                </p>
                              )}

                              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
                                <span aria-hidden="true">◷</span>
                                <span>
                                  {formatDate(reminder.reminderDate)}
                                </span>
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeStyles}`}
                            >
                              {status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="mb-8">
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  GET THINGS DONE
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                  Quick actions
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Jump straight into your workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    href: "/assistant",
                    icon: "✧",
                    title: "Ask AI",
                    description: "Get help from DigitalDost AI",
                    color: "text-cyan-300",
                    glow: "group-hover:border-cyan-400/30",
                  },
                  {
                    href: "/tasks",
                    icon: "✓",
                    title: "Manage Tasks",
                    description: "Organize your to-do list",
                    color: "text-emerald-300",
                    glow: "group-hover:border-emerald-400/30",
                  },
                  {
                    href: "/reminders",
                    icon: "◷",
                    title: "Set Reminder",
                    description: "Remember what matters",
                    color: "text-amber-300",
                    glow: "group-hover:border-amber-400/30",
                  },
                  {
                    href: "/notes",
                    icon: "▤",
                    title: "Write a Note",
                    description: "Capture ideas quickly",
                    color: "text-blue-300",
                    glow: "group-hover:border-blue-400/30",
                  },
                ].map((action) => (
                  <a
                    key={action.href}
                    href={action.href}
                    className={`dd-card dd-link group rounded-2xl border border-slate-800/90 bg-slate-900/70 p-5 transition ${action.glow}`}
                  >
                    <div
                      className={`dd-hover-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-2xl ${action.color}`}
                    >
                      {action.icon}
                    </div>

                    <h3 className="font-semibold text-slate-100">
                      {action.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {action.description}
                    </p>

                    <p className="mt-4 text-xs font-semibold text-slate-500 transition group-hover:text-cyan-300">
                      Open workspace <span aria-hidden="true">↗</span>
                    </p>
                  </a>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-6">
              <div className="flex flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
                <p className="text-xs text-slate-500">
                  © {new Date().getFullYear()} DigitalDost
                </p>
                <p className="text-xs text-slate-500">
                  Your digital life, simplified.{" "}
                  <span className="text-cyan-400">✦</span>
                </p>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </main>
  );
}
