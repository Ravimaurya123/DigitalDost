"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] =
    useState(false);
  const [aiAssistant, setAiAssistant] = useState(true);
  const [timeFormat, setTimeFormat] = useState("12");

  // Theme
  const [theme, setTheme] = useState("dark");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadUser();
    loadSettings();
    loadTheme();
  }, []);

  // =========================
  // LOAD USER
  // =========================

  async function loadUser() {
    try {
      const response = await fetch("/api/auth/me", {
        cache: "no-store",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("SETTINGS USER ERROR:", error);
    }
  }

  // =========================
  // LOAD SETTINGS
  // =========================

  function loadSettings() {
    try {
      const stored = localStorage.getItem(
        "digitaldost-settings"
      );

      if (!stored) {
        return;
      }

      const settings = JSON.parse(stored);

      setNotifications(
        settings.notifications ?? true
      );

      setEmailNotifications(
        settings.emailNotifications ?? false
      );

      setAiAssistant(
        settings.aiAssistant ?? true
      );

      setTimeFormat(
        settings.timeFormat ?? "12"
      );
    } catch (error) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );
    }
  }

  // =========================
  // LOAD THEME
  // =========================

  function loadTheme() {
    try {
      const savedTheme =
        localStorage.getItem(
          "digitaldost-theme"
        );

      if (savedTheme === "light") {
        setTheme("light");

        document.documentElement.classList.add(
          "light-mode"
        );
      } else {
        setTheme("dark");

        document.documentElement.classList.remove(
          "light-mode"
        );
      }
    } catch (error) {
      console.error(
        "LOAD THEME ERROR:",
        error
      );
    }
  }

  // =========================
  // TOGGLE THEME
  // =========================

  function toggleTheme() {
    const html =
      document.documentElement;

    const newTheme =
      theme === "dark"
        ? "light"
        : "dark";

    if (newTheme === "light") {
      html.classList.add("light-mode");
    } else {
      html.classList.remove("light-mode");
    }

    localStorage.setItem(
      "digitaldost-theme",
      newTheme
    );

    setTheme(newTheme);
  }

  // =========================
  // SAVE SETTINGS
  // =========================

  function saveSettings() {
    const settings = {
      notifications,
      emailNotifications,
      aiAssistant,
      timeFormat,
    };

    localStorage.setItem(
      "digitaldost-settings",
      JSON.stringify(settings)
    );

    // Save theme also
    localStorage.setItem(
      "digitaldost-theme",
      theme
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  const initials = getInitials(
    user?.name
  );

  const isLightMode =
    theme === "light";

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="mx-auto max-w-6xl px-6 py-6">

          <Link
            href="/dashboard"
            className="text-sm text-cyan-400 transition hover:text-cyan-300"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold">
            Settings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Customize your DigitalDost experience.
          </p>

        </div>

      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="mx-auto max-w-6xl px-6 py-8">

        <div className="grid gap-6 md:grid-cols-2">

          {/* =========================
              PROFILE
          ========================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">

            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold text-slate-950">
                {initials}
              </div>

              <div>

                <h2 className="text-xl font-bold text-white">
                  {user?.name || "Loading..."}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {user?.email || "Loading..."}
                </p>

                <p className="mt-2 text-xs text-cyan-400">
                  DigitalDost Account
                </p>

              </div>

            </div>

          </div>

          {/* =========================
              NOTIFICATIONS
          ========================= */}

          <SettingCard
            icon="🔔"
            title="Notifications"
            description="Manage your reminder notifications."
          >

            <Toggle
              title="Reminder Notifications"
              description="Receive browser notifications for reminders."
              value={notifications}
              setValue={setNotifications}
            />

            <div className="my-5 border-t border-slate-800" />

            <Toggle
              title="Email Notifications"
              description="Receive important updates by email."
              value={emailNotifications}
              setValue={setEmailNotifications}
            />

          </SettingCard>

          {/* =========================
              AI ASSISTANT
          ========================= */}

          <SettingCard
            icon="🤖"
            title="AI Assistant"
            description="Control DigitalDost AI features."
          >

            <Toggle
              title="AI Assistant"
              description="Enable AI-powered DigitalDost features."
              value={aiAssistant}
              setValue={setAiAssistant}
            />

            <div className="mt-5 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">

              <p className="text-sm font-semibold text-cyan-400">
                AI Command Center
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage tasks, reminders and notes
                using natural language.
              </p>

            </div>

          </SettingCard>

          {/* =========================
              TIME FORMAT
          ========================= */}

          <SettingCard
            icon="🕐"
            title="Time Format"
            description="Choose your preferred time format."
          >

            <select
              value={timeFormat}
              onChange={(event) =>
                setTimeFormat(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >

              <option value="12">
                12 Hour — 10:30 PM
              </option>

              <option value="24">
                24 Hour — 22:30
              </option>

            </select>

          </SettingCard>

          {/* =========================
              APPEARANCE
          ========================= */}

          <SettingCard
            icon={isLightMode ? "☀️" : "🌙"}
            title="Appearance"
            description="Choose between Light Mode and Dark Mode."
          >

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="text-sm font-semibold text-white">
                    {isLightMode
                      ? "Light Mode"
                      : "Dark Mode"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {isLightMode
                      ? "Light theme is currently active."
                      : "Dark theme is currently active."}
                  </p>

                </div>

                {/* REAL THEME SWITCH */}

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle dark and light mode"
                  className={`relative h-7 w-14 shrink-0 rounded-full transition-all duration-300 ${
                    isLightMode
                      ? "bg-cyan-500"
                      : "bg-slate-700"
                  }`}
                >

                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      isLightMode
                        ? "left-8"
                        : "left-1"
                    }`}
                  />

                </button>

              </div>

              {/* Current mode */}

              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">

                <span className="text-xs text-slate-500">
                  Current Theme
                </span>

                <span className="text-xs font-semibold text-cyan-400">
                  {isLightMode
                    ? "LIGHT"
                    : "DARK"}
                </span>

              </div>

            </div>

          </SettingCard>

          {/* =========================
              DIGITALDOST FEATURES
          ========================= */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">

            <div className="mb-6">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                  ✨
                </div>

                <div>

                  <h2 className="font-semibold text-white">
                    DigitalDost Features
                  </h2>

                  <p className="text-xs text-slate-500">
                    Everything available in your workspace.
                  </p>

                </div>

              </div>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <Feature
                icon="🤖"
                title="AI Assistant"
                text="Ask questions and get AI help."
              />

              <Feature
                icon="✅"
                title="Tasks"
                text="Manage your daily tasks."
              />

              <Feature
                icon="🔔"
                title="Reminders"
                text="Never miss important activities."
              />

              <Feature
                icon="📄"
                title="Documents"
                text="Ask AI questions from PDFs."
              />

            </div>

          </div>

        </div>

        {/* =========================
            SAVE SETTINGS
        ========================= */}

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            {saved ? (
              <p className="text-sm font-medium text-emerald-400">
                ✓ Settings saved successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Your preferences are saved on this device.
              </p>
            )}

          </div>

          <button
            type="button"
            onClick={saveSettings}
            className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Save Settings
          </button>

        </div>

      </section>

    </main>
  );
}

/* =========================
   SETTING CARD
========================= */

function SettingCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <div className="mb-6 flex items-start gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl">
          {icon}
        </div>

        <div>

          <h2 className="font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>

        </div>

      </div>

      {children}

    </div>
  );
}

/* =========================
   TOGGLE
========================= */

function Toggle({
  title,
  description,
  value,
  setValue,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div>

        <p className="text-sm font-medium text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>

      </div>

      <button
        type="button"
        onClick={() => setValue(!value)}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          value
            ? "bg-cyan-500"
            : "bg-slate-700"
        }`}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            value
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}

/* =========================
   FEATURE
========================= */

function Feature({
  icon,
  title,
  text,
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

      <div className="text-2xl">
        {icon}
      </div>

      <h3 className="mt-3 text-sm font-semibold text-white">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>

    </div>
  );
}

/* =========================
   INITIALS
========================= */

function getInitials(name) {
  if (!name) {
    return "?";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    words[0]
      .charAt(0)
      .toUpperCase() +
    words[words.length - 1]
      .charAt(0)
      .toUpperCase()
  );
}