"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  const [user, setUser] = useState(null);

  const [notifications, setNotifications] =
    useState(true);

  const [emailNotifications, setEmailNotifications] =
    useState(false);

  const [aiAssistant, setAiAssistant] =
    useState(true);

  const [timeFormat, setTimeFormat] =
    useState("12");

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(
          "LOAD USER ERROR:",
          error
        );
      }
    }

    loadUser();

    const savedSettings =
      localStorage.getItem(
        "digitaldost-settings"
      );

    if (savedSettings) {
      try {
        const settings =
          JSON.parse(savedSettings);

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
          "SETTINGS LOAD ERROR:",
          error
        );
      }
    }
  }, []);

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

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* Header */}

      <header className="border-b border-slate-800 bg-slate-950/90 px-6 py-5 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <div>
            <Link
              href="/dashboard"
              className="text-sm text-cyan-400 hover:text-cyan-300"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-2 text-2xl font-bold">
              Settings
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your DigitalDost preferences.
            </p>
          </div>

        </div>
      </header>

      {/* Content */}

      <section className="mx-auto max-w-6xl px-6 py-8">

        <div className="grid gap-6 lg:grid-cols-3">

          {/* Profile */}

          <div className="lg:col-span-3">

            <SettingsCard
              icon="👤"
              title="Profile"
              description="Your DigitalDost account information."
            >

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-2xl font-bold text-slate-950">
                  {getInitials(
                    user?.name
                  )}
                </div>

                <div>
                  <p className="text-xl font-semibold text-white">
                    {user?.name ||
                      "Loading..."}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {user?.email ||
                      "Loading..."}
                  </p>
                </div>

              </div>

            </SettingsCard>

          </div>

          {/* Notifications */}

          <SettingsCard
            icon="🔔"
            title="Notifications"
            description="Control your DigitalDost reminders."
          >

            <ToggleRow
              title="Reminder Notifications"
              description="Show browser notifications for reminders."
              enabled={notifications}
              onChange={setNotifications}
            />

            <div className="my-5 border-t border-slate-800" />

            <ToggleRow
              title="Email Notifications"
              description="Receive important updates by email."
              enabled={emailNotifications}
              onChange={
                setEmailNotifications
              }
            />

          </SettingsCard>

          {/* AI */}

          <SettingsCard
            icon="🤖"
            title="AI Assistant"
            description="Customize your AI experience."
          >

            <ToggleRow
              title="AI Assistant"
              description="Allow DigitalDost AI features."
              enabled={aiAssistant}
              onChange={setAiAssistant}
            />

            <div className="mt-6 rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">

              <p className="text-sm font-medium text-cyan-400">
                AI Command Center
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Use natural language to manage
                your tasks, reminders and notes.
              </p>

            </div>

          </SettingsCard>

          {/* Time */}

          <SettingsCard
            icon="🕐"
            title="Time & Date"
            description="Choose how DigitalDost displays time."
          >

            <label className="mb-3 block text-sm font-medium text-slate-300">
              Time Format
            </label>

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
                12-hour (AM / PM)
              </option>

              <option value="24">
                24-hour
              </option>
            </select>

          </SettingsCard>

          {/* Appearance */}

          <SettingsCard
            icon="🌙"
            title="Appearance"
            description="DigitalDost currently uses a dark interface."
          >

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-white">
                    Dark Mode
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Optimized for the DigitalDost
                    workspace.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                  🌙
                </div>

              </div>

              <div className="mt-4 rounded-lg bg-slate-900 px-3 py-2 text-xs text-cyan-400">
                ✓ Currently active
              </div>

            </div>

          </SettingsCard>

          {/* Security */}

          <SettingsCard
            icon="🔒"
            title="Security"
            description="Manage your account security."
          >

            <Link
              href="/login"
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-cyan-500/40"
            >

              <div>
                <p className="text-sm font-medium text-white">
                  Account Login
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your account uses secure authentication.
                </p>
              </div>

              <span className="text-slate-500">
                →
              </span>

            </Link>

          </SettingsCard>

          {/* About */}

          <div className="lg:col-span-3">

            <SettingsCard
              icon="ℹ️"
              title="About DigitalDost"
              description="Your personal digital assistant."
            >

              <div className="grid gap-4 sm:grid-cols-3">

                <AboutItem
                  icon="🤖"
                  title="AI Assistant"
                  text="Get intelligent help anytime."
                />

                <AboutItem
                  icon="✅"
                  title="Task Manager"
                  text="Organize your daily work."
                />

                <AboutItem
                  icon="📄"
                  title="Document Assistant"
                  text="Ask questions from your PDFs."
                />

              </div>

              <div className="mt-6 border-t border-slate-800 pt-5">

                <p className="text-xs text-slate-600">
                  DigitalDost • Personal Digital
                  Assistant
                </p>

              </div>

            </SettingsCard>

          </div>

        </div>

        {/* Save */}

        <div className="sticky bottom-4 mt-8 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">

          <div>

            {saved ? (
              <p className="text-sm font-medium text-emerald-400">
                ✓ Settings saved successfully.
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Changes are saved on this device.
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
   SETTINGS CARD
========================= */

function SettingsCard({
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

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
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
        onClick={() =>
          onChange(!enabled)
        }
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled
            ? "bg-cyan-500"
            : "bg-slate-700"
        }`}
        aria-label={title}
      >

        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />

      </button>

    </div>
  );
}


/* =========================
   ABOUT ITEM
========================= */

function AboutItem({
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
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1]
      .charAt(0)
      .toUpperCase()
  );
}