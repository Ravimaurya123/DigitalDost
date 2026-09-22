"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  async function loadUnreadCount() {
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      setUnreadCount(data?.unreadCount || 0);
    } catch (error) {
      console.error(
        "NOTIFICATION BELL ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnreadCount();

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => router.push("/notifications")}
      aria-label="Notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl transition hover:-translate-y-0.5 hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500 dark:hover:bg-cyan-500/10"
    >
      <span>🔔</span>

      {!loading && unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}