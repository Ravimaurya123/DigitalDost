
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const menuItems = [
    { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/assistant", icon: "🤖", label: "AI Assistant" },
    { href: "/ai-history", icon: "📜", label: "AI History" },
    { href: "/tasks", icon: "✅", label: "Tasks" },
    { href: "/reminders", icon: "🔔", label: "Reminders" },
    { href: "/notes", icon: "📝", label: "Notes" },
    { href: "/documents", icon: "📄", label: "Documents" },
    { href: "/profile", icon: "👤", label: "Profile" },
    { href: "/notifications", icon: "🔔", label: "Notifications" },
    { href: "/settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <aside className="w-full min-w-0 lg:w-[240px] lg:shrink-0">
      <div className="dd-card overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {/* Mobile and tablet menu button */}
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          aria-controls="digitaldost-sidebar-menu"
          className="dd-button flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:hidden"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="dd-hover-icon shrink-0 text-lg" aria-hidden="true">
              ☰
            </span>
            <span className="truncate font-semibold text-white">
              Navigation Menu
            </span>
          </span>

          <span
            className={`shrink-0 text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            ▼
          </span>
        </button>

        {/* Desktop sidebar */}
        <div className="hidden p-3 lg:block xl:p-4">
          <p className="mb-3 px-3 text-xs uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <SidebarLinks
            menuItems={menuItems}
            pathname={pathname}
          />

          <div className="mt-4 border-t border-slate-800 pt-4">
            <LogoutButton />
          </div>
        </div>

        {/* Mobile and tablet expandable menu */}
        {open && (
          <div
            id="digitaldost-sidebar-menu"
            className="border-t border-slate-800 p-3 sm:p-4 lg:hidden"
          >
            <p className="mb-3 px-3 text-xs uppercase tracking-wider text-slate-500">
              Navigate to
            </p>

            <SidebarLinks
              menuItems={menuItems}
              pathname={pathname}
              onNavigate={() => setOpen(false)}
            />

            <div className="mt-4 border-t border-slate-800 pt-4">
              <LogoutButton />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarLinks({ menuItems, pathname, onNavigate }) {
  return (
    <nav aria-label="Dashboard navigation" className="space-y-1">
      {menuItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" &&
            pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`dd-link flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors duration-200 ${
              isActive
                ? "border border-cyan-500/30 bg-cyan-500/10 font-semibold text-cyan-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span
              className="dd-hover-icon w-6 shrink-0 text-center"
              aria-hidden="true"
            >
              {item.icon}
            </span>

            <span className="min-w-0 flex-1 break-words">
              {item.label}
            </span>

            {isActive && (
              <span
                className="ml-auto shrink-0 text-cyan-400"
                aria-hidden="true"
              >
                ●
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
