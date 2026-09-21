import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

import Task from "@/models/Task";
import Note from "@/models/Note";
import Reminder from "@/models/Reminder";

import LogoutButton from "@/components/LogoutButton";
import ReminderNotification from "@/components/ReminderNotification";
import AICommandCenter from "@/components/AICommandCenter";

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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}

            <a
              href="/dashboard"
              className="text-2xl font-bold text-cyan-400"
            >
              DigitalDost
            </a>

            {/* User */}

            <div className="flex items-center gap-4">

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium">
                  {user.name}
                </p>

                <p className="text-xs text-slate-400">
                  {user.email}
                </p>
              </div>

              <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center">
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

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid lg:grid-cols-[240px_1fr] gap-8">

          {/* ====================================== */}
          {/* SIDEBAR */}
          {/* ====================================== */}

          <aside>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">

              <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-3">
                Menu
              </p>

              <div className="space-y-1">

                <a
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl bg-cyan-500/10 text-cyan-400"
                >
                  📊
                  <span>Dashboard</span>
                </a>

                <a
                  href="/assistant"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  🤖
                  <span>AI Assistant</span>
                </a>

                <a
                  href="/tasks"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  ✅
                  <span>Tasks</span>
                </a>

                <a
                  href="/reminders"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  🔔
                  <span>Reminders</span>
                </a>

                <a
                  href="/notes"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  📝
                  <span>Notes</span>
                </a>

                <a
                  href="/documents"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  📄
                  <span>Documents</span>
                </a>

                <a
                  href="#"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  ⚙️
                  <span>Settings</span>
                </a>

              </div>

              {/* Logout */}

              <div className="border-t border-slate-800 mt-4 pt-4">
                <LogoutButton />
              </div>

            </div>

          </aside>

          {/* ====================================== */}
          {/* DASHBOARD CONTENT */}
          {/* ====================================== */}

          <section>

            {/* ====================================== */}
            {/* GREETING */}
            {/* ====================================== */}

            <div className="mb-8">

              <p className="text-cyan-400 text-sm mb-2">
                Welcome back 👋
              </p>

              <h1 className="text-4xl font-bold">
                Hello, {user.name}
              </h1>

              <p className="text-slate-400 mt-2">
                Manage your digital life from one place.
              </p>

            </div>

            {/* ====================================== */}
            {/* STATS */}
            {/* ====================================== */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

              {/* TOTAL TASKS */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Total Tasks
                </p>

                <p className="text-3xl font-bold mt-2">
                  {totalTasks}
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  All tasks
                </p>

              </div>

              {/* COMPLETED */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Completed
                </p>

                <p className="text-3xl font-bold text-green-400 mt-2">
                  {completedTasks}
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  Completed tasks
                </p>

              </div>

              {/* PENDING */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Pending
                </p>

                <p className="text-3xl font-bold text-yellow-400 mt-2">
                  {pendingTasks}
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  Tasks remaining
                </p>

              </div>

              {/* REMINDERS */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <p className="text-slate-400 text-sm">
                  Reminders
                </p>

                <p className="text-3xl font-bold text-cyan-400 mt-2">
                  {pendingReminders.length}
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  Pending reminders
                </p>

              </div>

            </div>

            {/* ====================================== */}
            {/* REMINDER SUMMARY */}
            {/* ====================================== */}

            <div className="grid sm:grid-cols-3 gap-4 mb-8">

              {/* TODAY */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-slate-400 text-sm">
                      Today
                    </p>

                    <p className="text-2xl font-bold text-cyan-400 mt-2">
                      {todayReminders.length}
                    </p>

                  </div>

                  <div className="text-3xl">
                    📅
                  </div>

                </div>

                <p className="text-slate-500 text-sm mt-2">
                  Today's reminders
                </p>

              </div>

              {/* UPCOMING */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-slate-400 text-sm">
                      Upcoming
                    </p>

                    <p className="text-2xl font-bold text-green-400 mt-2">
                      {upcomingReminders.length}
                    </p>

                  </div>

                  <div className="text-3xl">
                    ⏰
                  </div>

                </div>

                <p className="text-slate-500 text-sm mt-2">
                  Future reminders
                </p>

              </div>

              {/* OVERDUE */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-slate-400 text-sm">
                      Overdue
                    </p>

                    <p className="text-2xl font-bold text-red-400 mt-2">
                      {overdueReminders.length}
                    </p>

                  </div>

                  <div className="text-3xl">
                    ⚠️
                  </div>

                </div>

                <p className="text-slate-500 text-sm mt-2">
                  Missed reminders
                </p>

              </div>

            </div>

            {/* 
            {/* ====================================== */}
            {/* AI COMMAND CENTER */}
            {/* ====================================== */}

            <AICommandCenter />
            {/* ====================================== */}
            {/* TODAY TASKS + REMINDERS */}
            {/* ====================================== */}

            <div className="grid lg:grid-cols-2 gap-6 mb-8">

              {/* TODAY TASKS */}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h2 className="text-xl font-semibold">
                      Today's Tasks
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                      Tasks scheduled for today
                    </p>

                  </div>

                  <a
                    href="/tasks"
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    View All →
                  </a>

                </div>

                {todayTasks.length === 0 ? (

                  <div className="text-center py-8">

                    <p className="text-slate-400">
                      No tasks for today.
                    </p>

                    <a
                      href="/tasks"
                      className="inline-block mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-medium"
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
                          className="bg-slate-800/60 border border-slate-700 rounded-xl p-4"
                        >

                          <div className="flex items-center justify-between gap-4">

                            <div>

                              <h3
                                className={`font-semibold ${
                                  task.completed
                                    ? "line-through text-slate-500"
                                    : "text-white"
                                }`}
                              >
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="text-slate-400 text-sm mt-1">
                                  {task.description}
                                </p>
                              )}

                            </div>

                            <span
                              className={`text-xs px-3 py-1 rounded-full ${
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

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h2 className="text-xl font-semibold">
                      Smart Reminders 🔔
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                      Today and upcoming reminders
                    </p>

                  </div>

                  <a
                    href="/reminders"
                    className="text-cyan-400 hover:text-cyan-300 text-sm"
                  >
                    View All →
                  </a>

                </div>

                {dashboardReminders.length === 0 ? (

                  <div className="text-center py-8">

                    <p className="text-slate-400">
                      No active reminders.
                    </p>

                    <a
                      href="/reminders"
                      className="inline-block mt-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-medium"
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
                            className={`border rounded-xl p-4 ${
                              status === "Overdue"
                                ? "border-red-500/30 bg-red-500/5"
                                : status === "Today"
                                ? "border-cyan-500/30 bg-cyan-500/5"
                                : "border-slate-700 bg-slate-800/60"
                            }`}
                          >

                            <div className="flex items-start justify-between gap-4">

                              <div className="flex-1">

                                <h3 className="font-semibold">
                                  🔔 {reminder.title}
                                </h3>

                                {reminder.description && (
                                  <p className="text-slate-400 text-sm mt-1">
                                    {reminder.description}
                                  </p>
                                )}

                                <p className="text-cyan-400 text-sm mt-2">
                                  📅{" "}
                                  {formatDate(
                                    reminder.reminderDate
                                  )}
                                </p>

                              </div>

                              <span
                                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${
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

              <h2 className="text-xl font-semibold mb-4">
                Quick Actions
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* AI */}

                <a
                  href="/assistant"
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition"
                >

                  <div className="text-2xl mb-3">
                    🤖
                  </div>

                  <h3 className="font-semibold">
                    Ask AI
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    Talk with DigitalDost AI
                  </p>

                </a>

                {/* TASK */}

                <a
                  href="/tasks"
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition"
                >

                  <div className="text-2xl mb-3">
                    ✅
                  </div>

                  <h3 className="font-semibold">
                    Add Task
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    Create a new task
                  </p>

                </a>

                {/* REMINDER */}

                <a
                  href="/reminders"
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition"
                >

                  <div className="text-2xl mb-3">
                    🔔
                  </div>

                  <h3 className="font-semibold">
                    Add Reminder
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    Set a smart reminder
                  </p>

                </a>

                {/* NOTE */}

                <a
                  href="/notes"
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-5 transition"
                >

                  <div className="text-2xl mb-3">
                    📝
                  </div>

                  <h3 className="font-semibold">
                    Add Note
                  </h3>

                  <p className="text-slate-400 text-sm mt-1">
                    Write a quick note
                  </p>

                </a>

              </div>

            </div>

            {/* ====================================== */}
            {/* FOOTER */}
            {/* ====================================== */}

            <div className="border-t border-slate-800 mt-10 pt-6">

              <p className="text-center text-slate-500 text-sm">
                DigitalDost — Your Digital Life, Simplified. 🚀
              </p>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}