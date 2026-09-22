"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to load notifications."
        );
      }

      setNotifications(data.notifications || []);
    } catch (error) {
      console.error("LOAD NOTIFICATIONS ERROR:", error);
      setError(error.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function markAsRead(id) {
    try {
      setActionLoading(id);

      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRead: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("MARK READ ERROR:", error);
      setError(error.message || "Failed to update notification.");
    } finally {
      setActionLoading("");
    }
  }

  async function deleteNotification(id) {
    try {
      setActionLoading(id);

      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete notification."
        );
      }

      setNotifications((previous) =>
        previous.filter((notification) => notification._id !== id)
      );
    } catch (error) {
      console.error("DELETE NOTIFICATION ERROR:", error);
      setError(error.message || "Failed to delete notification.");
    } finally {
      setActionLoading("");
    }
  }

  async function markAllAsRead() {
    try {
      setActionLoading("all");

      const response = await fetch(
        "/api/notifications/read-all",
        {
          method: "PATCH",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to mark all as read."
        );
      }

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("MARK ALL READ ERROR:", error);
      setError(
        error.message || "Failed to mark all notifications as read."
      );
    } finally {
      setActionLoading("");
    }
  }

  function getTypeIcon(type) {
    switch (type) {
      case "task":
        return "✅";
      case "reminder":
        return "⏰";
      case "ai":
        return "🤖";
      case "document":
        return "📄";
      default:
        return "🔔";
    }
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="mb-3 text-sm text-slate-500 transition hover:text-cyan-500 dark:text-slate-400"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Stay updated with your DigitalDost activities.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              disabled={actionLoading === "all"}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-600 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-400"
            >
              {actionLoading === "all"
                ? "Updating..."
                : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500 dark:border-slate-700 dark:border-t-cyan-400" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 text-5xl">🔔</div>

            <h2 className="text-xl font-semibold">
              No notifications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Your task, reminder, AI, and document updates
              will appear here.
            </p>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`group rounded-2xl border p-4 transition sm:p-5 ${
                  notification.isRead
                    ? "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                    : "border-cyan-500/30 bg-cyan-500/5 shadow-sm dark:bg-cyan-500/5"
                }`}
              >
                <div className="flex gap-4">

                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                      notification.isRead
                        ? "bg-slate-100 dark:bg-slate-800"
                        : "bg-cyan-500/15"
                    }`}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="h-2 w-2 rounded-full bg-cyan-500" />
                        )}
                      </div>

                      <span className="text-xs text-slate-400">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            markAsRead(notification._id)
                          }
                          disabled={
                            actionLoading === notification._id
                          }
                          className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
                        >
                          {actionLoading === notification._id
                            ? "Updating..."
                            : "Mark as read"}
                        </button>
                      )}

                      {notification.link && (
                        <button
                          onClick={() =>
                            router.push(notification.link)
                          }
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Open
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(notification._id)
                        }
                        disabled={
                          actionLoading === notification._id
                        }
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}