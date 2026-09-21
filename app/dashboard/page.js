import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Note from "@/models/Note";
import Reminder from "@/models/Reminder";

import ReminderNotification from "@/components/ReminderNotification";
import AICommandCenter from "@/components/AICommandCenter";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function DashboardPage() {
  // ==========================================
  // CHECK LOGIN
  // ==========================================

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // ==========================================
  // CONNECT DATABASE
  // ==========================================

  await connectDB();

  // ==========================================
  // GET TASKS
  // ==========================================

  const tasks = await Task.find({
    userId: user.userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  // ==========================================
  // GET NOTES
  // ==========================================

  const notes = await Note.find({
    userId: user.userId,
  })
    .sort({
      createdAt: -1,
    })
    .lean();

  // ==========================================
  // GET REMINDERS
  // ==========================================

  const reminders = await Reminder.find({
    userId: user.userId,
  })
    .sort({
      reminderDate: 1,
    })
    .lean();

  // ==========================================
  // TASK COUNTS
  // ==========================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks = tasks.filter(
    (task) => !task.completed
  ).length;

  // ==========================================
  // CURRENT DATE
  // ==========================================

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

  // ==========================================
  // REMINDER FILTERING
  // ==========================================

  const pendingReminders = reminders.filter(
    (reminder) => !reminder.completed
  );

  // ==========================================
  // TODAY REMINDERS
  // ==========================================

  const todayReminders = pendingReminders.filter(
    (reminder) => {
      const reminderDate = new Date(
        reminder.reminderDate
      );

      return (
        reminderDate >= startOfToday &&
        reminderDate < endOfToday
      );
    }
  );

  // ==========================================
  // UPCOMING REMINDERS
  // ==========================================

  const upcomingReminders = pendingReminders.filter(
    (reminder) => {
      const reminderDate = new Date(
        reminder.reminderDate
      );

      return reminderDate >= endOfToday;
    }
  );

  // ==========================================
  // OVERDUE REMINDERS
  // ==========================================

  const overdueReminders = pendingReminders.filter(
    (reminder) => {
      const reminderDate = new Date(
        reminder.reminderDate
      );

      return reminderDate < now;
    }
  );

  // ==========================================
  // DASHBOARD REMINDERS
  // ==========================================

  const dashboardReminders = [
    ...todayReminders,
    ...upcomingReminders,
  ].slice(0, 5);

  // ==========================================
  // TODAY TASKS
  // ==========================================

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) {
      return false;
    }

    const dueDate = new Date(task.dueDate);

    return (
      dueDate >= startOfToday &&
      dueDate < endOfToday
    );
  });

  // ==========================================
  // FORMAT DATE
  // ==========================================

  function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // ==========================================
  // GET REMINDER STATUS
  // ==========================================

  function getReminderStatus(reminder) {
    const reminderDate = new Date(
      reminder.reminderDate
    );

    if (reminderDate < now) {
      return "Overdue";
    }

    if (
      reminderDate >= startOfToday &&
      reminderDate < endOfToday
    ) {
      return "Today";
    }

    return "Upcoming";
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* ====================================== */}
      {/* REMINDER NOTIFICATION SYSTEM */}
      {/* ====================================== */}

      <ReminderNotification />

      {/* ====================================== */}
      {/* NAVBAR */}
      {/* ====================================== */}

      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}

            <a
              href="/dashboard"
              className="text-xl font-bold text-cyan-400 sm:text-2xl"
            >
              DigitalDost
            </a>

            {/* User */}

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">
                  {user.name}
                </p>

                <p className="text-xs text-slate-400">
                  {user.email}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 font-bold text-slate-950 sm:h-10 sm:w-10">
                {user.name
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ====================================== */}
      {/* MAIN */}
      {/* ====================================== */}

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* ====================================== */}
          {/* RESPONSIVE SIDEBAR */}
          {/* ====================================== */}

          <DashboardSidebar />

          {/* ====================================== */}
          {/* DASHBOARD CONTENT */}
          {/* ====================================== */}

          <section className="min-w-0 flex-1">
            {/* ====================================== */}
            {/* GREETING */}
            {/* ====================================== */}

            <div className="mb-6 sm:mb-8">
              <p className="mb-2 text-sm text-cyan-400">
                Welcome back 👋
              </p>

              <h1 className="text-2xl font-bold sm:text-4xl">
                Hello, {user.name}
              </h1>

              <p className="mt-2 text-sm text-slate-400 sm:text-base">
                Manage your digital life from one place.
              </p>
            </div>

            {/* ====================================== */}
            {/* STATS */}
            {/* ====================================== */}

            <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
              {/* TOTAL TASKS */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                <p className="text-xs text-slate-400 sm:text-sm">
                  Total Tasks
                </p>

                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {totalTasks}
                </p>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  All tasks
                </p>
              </div>

              {/* COMPLETED */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                <p className="text-xs text-slate-400 sm:text-sm">
                  Completed
                </p>

                <p className="mt-2 text-2xl font-bold text-green-400 sm:text-3xl">
                  {completedTasks}
                </p>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Completed tasks
                </p>
              </div>

              {/* PENDING */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                <p className="text-xs text-slate-400 sm:text-sm">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-yellow-400 sm:text-3xl">
                  {pendingTasks}
                </p>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Tasks remaining
                </p>
              </div>

              {/* REMINDERS */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
                <p className="text-xs text-slate-400 sm:text-sm">
                  Reminders
                </p>

                <p className="mt-2 text-2xl font-bold text-cyan-400 sm:text-3xl">
                  {pendingReminders.length}
                </p>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  Pending reminders
                </p>
              </div>
            </div>

            {/* ====================================== */}
            {/* REMINDER SUMMARY */}
            {/* ====================================== */}

            <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
              {/* TODAY */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Today
                    </p>

                    <p className="mt-2 text-2xl font-bold text-cyan-400">
                      {todayReminders.length}
                    </p>
                  </div>

                  <div className="text-3xl">
                    📅
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Today's reminders
                </p>
              </div>

              {/* UPCOMING */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Upcoming
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-400">
                      {upcomingReminders.length}
                    </p>
                  </div>

                  <div className="text-3xl">
                    ⏰
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Future reminders
                </p>
              </div>

              {/* OVERDUE */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Overdue
                    </p>

                    <p className="mt-2 text-2xl font-bold text-red-400">
                      {overdueReminders.length}
                    </p>
                  </div>

                  <div className="text-3xl">
                    ⚠️
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Missed reminders
                </p>
              </div>
            </div>

            {/* ====================================== */}
            {/* AI COMMAND CENTER */}
            {/* ====================================== */}

            <AICommandCenter />

            {/* ====================================== */}
            {/* TODAY TASKS + REMINDERS */}
            {/* ====================================== */}

            <div className="mb-6 grid grid-cols-1 gap-5 sm:mb-8 lg:grid-cols-2 lg:gap-6">
              {/* TODAY TASKS */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Today's Tasks
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Tasks scheduled for today
                    </p>
                  </div>

                  <a
                    href="/tasks"
                    className="whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    View All →
                  </a>
                </div>

                {todayTasks.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mb-3 text-3xl">
                      ✅
                    </div>

                    <p className="text-sm text-slate-400">
                      No tasks for today.
                    </p>

                    <a
                      href="/tasks"
                      className="mt-4 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                    >
                      + Create Task
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks
                      .slice(0, 5)
                      .map((task) => (
                        <div
                          key={task._id.toString()}
                          className="rounded-xl border border-slate-700 bg-slate-800/60 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
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
                              className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${
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
                      ))}
                  </div>
                )}
              </div>

              {/* SMART REMINDERS */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold sm:text-xl">
                      Smart Reminders 🔔
                    </h2>

                    <p className="mt-1 text-sm text-slate-400">
                      Today and upcoming reminders
                    </p>
                  </div>

                  <a
                    href="/reminders"
                    className="whitespace-nowrap text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    View All →
                  </a>
                </div>

                {dashboardReminders.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className="mb-3 text-3xl">
                      🔔
                    </div>

                    <p className="text-sm text-slate-400">
                      No active reminders.
                    </p>

                    <a
                      href="/reminders"
                      className="mt-4 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                    >
                      + Create Reminder
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboardReminders.map(
                      (reminder) => {
                        const status =
                          getReminderStatus(reminder);

                        return (
                          <div
                            key={reminder._id.toString()}
                            className={`rounded-xl border p-4 ${
                              status === "Overdue"
                                ? "border-red-500/30 bg-red-500/5"
                                : status === "Today"
                                ? "border-cyan-500/30 bg-cyan-500/5"
                                : "border-slate-700 bg-slate-800/60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h3 className="break-words font-semibold">
                                  🔔 {reminder.title}
                                </h3>

                                {reminder.description && (
                                  <p className="mt-1 break-words text-sm text-slate-400">
                                    {reminder.description}
                                  </p>
                                )}

                                <p className="mt-2 text-sm text-cyan-400">
                                  📅{" "}
                                  {formatDate(
                                    reminder.reminderDate
                                  )}
                                </p>
                              </div>

                              <span
                                className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs ${
                                  status === "Overdue"
                                    ? "bg-red-500/10 text-red-400"
                                    : status === "Today"
                                    ? "bg-cyan-500/10 text-cyan-400"
                                    : "bg-green-500/10 text-green-400"
                                }`}
                              >
                                {status}
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ====================================== */}
            {/* QUICK ACTIONS */}
            {/* ====================================== */}

            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {/* AI */}

                <a
                  href="/assistant"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/50 hover:bg-slate-900/80"
                >
                  <div className="mb-3 text-2xl">
                    🤖
                  </div>

                  <h3 className="font-semibold">
                    Ask AI
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Talk with DigitalDost AI
                  </p>
                </a>

                {/* TASK */}

                <a
                  href="/tasks"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/50 hover:bg-slate-900/80"
                >
                  <div className="mb-3 text-2xl">
                    ✅
                  </div>

                  <h3 className="font-semibold">
                    Add Task
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Create a new task
                  </p>
                </a>

                {/* REMINDER */}

                <a
                  href="/reminders"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/50 hover:bg-slate-900/80"
                >
                  <div className="mb-3 text-2xl">
                    🔔
                  </div>

                  <h3 className="font-semibold">
                    Add Reminder
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Set a smart reminder
                  </p>
                </a>

                {/* NOTE */}

                <a
                  href="/notes"
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/50 hover:bg-slate-900/80"
                >
                  <div className="mb-3 text-2xl">
                    📝
                  </div>

                  <h3 className="font-semibold">
                    Add Note
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Write a quick note
                  </p>
                </a>
              </div>
            </div>

            {/* ====================================== */}
            {/* FOOTER */}
            {/* ====================================== */}

            <div className="mt-10 border-t border-slate-800 pt-6">
              <p className="text-center text-xs text-slate-500 sm:text-sm">
                DigitalDost — Your Digital Life, Simplified. 🚀
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}