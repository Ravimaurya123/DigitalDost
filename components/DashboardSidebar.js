
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "⌂" },
  { name: "AI Assistant", href: "/assistant", icon: "✧" },
  { name: "AI History", href: "/ai-history", icon: "◷" },
  { name: "Tasks", href: "/tasks", icon: "✓" },
  { name: "Reminders", href: "/reminders", icon: "◷" },
  { name: "Notes", href: "/notes", icon: "▤" },
  { name: "Documents", href: "/documents", icon: "▧" },
  { name: "Notifications", href: "/notifications", icon: "♧" },
  { name: "Profile", href: "/profile", icon: "◎" },
  { name: "Settings", href: "/settings", icon: "⚙" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navigation = (
    <nav aria-label="Main navigation" className="space-y-1.5">
      {menuItems.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={`group flex min-h-11 items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
              active
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-[inset_3px_0_0_0_#22d3ee,0_0_18px_rgba(34,211,238,0.05)]"
                : "border-transparent text-slate-400 hover:border-slate-700/80 hover:bg-slate-800/70 hover:text-white"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-lg transition-colors ${
                active
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 group-hover:text-cyan-300"
              }`}
            >
              {item.icon}
            </span>

            <span className="min-w-0 flex-1">{item.name}</span>

            {active && (
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-64">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        aria-controls="digitaldost-sidebar-navigation"
        className="flex w-full items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/90 px-4 py-3.5 text-left shadow-lg shadow-black/10 transition hover:border-cyan-400/30 lg:hidden"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-xl text-cyan-300">
            ☰
          </span>

          <span>
            <span className="block text-sm font-semibold text-white">
              Navigation
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {menuItems.find((item) => isActive(item.href))?.name ||
                "Explore DigitalDost"}
            </span>
          </span>
        </span>

        <span
          aria-hidden="true"
          className={`text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          ⌄
        </span>
      </button>

      {/* Sidebar panel */}
      <div
        id="digitaldost-sidebar-navigation"
        className={`mt-3 rounded-2xl border border-slate-800/90 bg-slate-900/90 p-3 shadow-xl shadow-black/10 backdrop-blur-xl lg:mt-0 lg:block lg:p-4 ${
          open ? "block" : "hidden"
        }`}
      >
        {/* Brand area */}
        <div className="mb-5 hidden border-b border-slate-800 px-2 pb-4 lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 text-xl font-bold text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.08)]">
              D
            </div>

            <div className="min-w-0">
              <p className="font-bold tracking-wide text-white">
                DigitalDost
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Your productivity space
              </p>
            </div>
          </div>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>

        {navigation}

        <div className="mt-4 border-t border-slate-800 pt-4">
          <div className="rounded-xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] to-transparent p-3">
            <p className="text-sm font-semibold text-slate-200">
              Stay productive ✨
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Keep your tasks, notes and reminders in one place.
            </p>
          </div>

          <div className="mt-3 rounded-xl px-2 py-2 transition-colors hover:bg-slate-800/50">
            <LogoutButton />
          </div>
        </div>
      </div>
    </aside>
  );
}
