"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [aiAssistant, setAiAssistant] = useState(true);
  const [timeFormat, setTimeFormat] = useState("12");
  const [theme, setTheme] = useState("dark");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
    loadUser();
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

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/settings", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load settings."
        );
      }

      const settings = data.settings;

      setNotifications(settings.notifications);
      setEmailNotifications(settings.emailNotifications);
      setAiAssistant(settings.aiAssistant);
      setTimeFormat(settings.timeFormat);
      setTheme(settings.theme);

      applyTheme(settings.theme);
    } catch (error) {
      console.error("LOAD SETTINGS ERROR:", error);

      setError(
        error.message || "Failed to load settings."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // APPLY THEME
  // =========================

  function applyTheme(selectedTheme) {
    const html = document.documentElement;

    if (selectedTheme === "light") {
      html.classList.add("light-mode");
    } else {
      html.classList.remove("light-mode");
    }
  }

  // =========================
  // TOGGLE THEME
  // =========================

  async function toggleTheme() {
    const newTheme =
      theme === "dark" ? "light" : "dark";

    const oldTheme = theme;

    setTheme(newTheme);
    applyTheme(newTheme);
    setError("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: newTheme,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save theme."
        );
      }
    } catch (error) {
      console.error("THEME SAVE ERROR:", error);

      setTheme(oldTheme);
      applyTheme(oldTheme);

      setError(
        "Theme could not be saved. Please try again."
      );
    }
  }

  // =========================
  // SAVE ALL SETTINGS
  // =========================

  async function saveSettings() {
    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          notifications,
          emailNotifications,
          aiAssistant,
          timeFormat,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save settings."
        );
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error("SAVE SETTINGS ERROR:", error);

      setError(
        error.message || "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  const initials = getInitials(user?.name);
  const isLightMode = theme === "light";

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="dd-hover-icon mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link
            href="/dashboard"
            className="dd-link text-sm text-cyan-400"
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

      {/* MAIN CONTENT */}

      <section className="mx-auto max-w-6xl px-6 py-8">
        {/* ERROR */}

        {error && (
          <div className="dd-card mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* PROFILE */}

          <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
            <div className="flex items-center gap-5">
              <div className="dd-hover-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xl font-bold text-slate-950">
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

          {/* NOTIFICATIONS */}

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

          {/* AI */}

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

            <div className="dd-card mt-5 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
              <p className="text-sm font-semibold text-cyan-400">
                AI Command Center
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage tasks, reminders and notes using natural
                language.
              </p>
            </div>
          </SettingCard>

          {/* TIME FORMAT */}

          <SettingCard
            icon="🕐"
            title="Time Format"
            description="Choose your preferred time format."
          >
            <select
              value={timeFormat}
              onChange={(event) =>
                setTimeFormat(event.target.value)
              }
              className="dd-input w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="12">
                12 Hour — 10:30 PM
              </option>

              <option value="24">
                24 Hour — 22:30
              </option>
            </select>
          </SettingCard>

          {/* APPEARANCE */}

          <SettingCard
            icon={isLightMode ? "☀️" : "🌙"}
            title="Appearance"
            description="Choose between Light Mode and Dark Mode."
          >
            <div className="dd-card rounded-xl border border-slate-800 bg-slate-950 p-4">
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

                {/* THEME SWITCH */}

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className={`dd-button relative h-7 w-14 shrink-0 rounded-full ${
                    isLightMode
                      ? "bg-cyan-500"
                      : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                      isLightMode
                        ? "left-8"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="dd-card mt-4 flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2">
                <span className="text-xs text-slate-500">
                  Current Theme
                </span>

                <span className="text-xs font-semibold text-cyan-400">
                  {isLightMode ? "LIGHT" : "DARK"}
                </span>
              </div>
            </div>
          </SettingCard>

          {/* FEATURES */}

          <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="dd-hover-icon flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
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

        {/* SAVE SETTINGS */}

        <div className="dd-card mt-8 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {saved ? (
              <p className="text-sm font-medium text-emerald-400">
                ✓ Settings saved successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Your preferences are permanently saved to your
                account.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="dd-button rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </section>
    </main>
  );
}

/* =====================================================
   SETTING CARD
===================================================== */

function SettingCard({
  icon,
  title,
  description,
  children,
}) {
  return (
    <div className="dd-card rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6 flex items-start gap-4">
        <div className="dd-hover-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xl">
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

/* =====================================================
   TOGGLE
===================================================== */

function Toggle({
  title,
  description,
  value,
  setValue,
}) {
  return (
    <div className="dd-feature flex items-center justify-between gap-4 rounded-xl p-2">
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
        className={`dd-button relative h-6 w-11 shrink-0 rounded-full ${
          value ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all duration-200 ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

/* =====================================================
   FEATURE
===================================================== */

function Feature({
  icon,
  title,
  text,
}) {
  return (
    <div className="dd-feature rounded-xl border border-slate-800 bg-slate-950 p-4">
      <div className="dd-hover-icon text-2xl">
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

/* =====================================================
   INITIALS
===================================================== */

function getInitials(name) {
  if (!name) {
    return "?";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
}