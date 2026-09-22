"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function DashboardSidebar() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      href: "/dashboard",
      icon: "📊",
      label: "Dashboard",
    },
    {
      href: "/assistant",
      icon: "🤖",
      label: "AI Assistant",
    },
    {
      href: "/ai-history",
      icon: "📜",
      label: "AI History",
    },
    {
      href: "/tasks",
      icon: "✅",
      label: "Tasks",
    },
    {
      href: "/reminders",
      icon: "🔔",
      label: "Reminders",
    },
    {
      href: "/notes",
      icon: "📝",
      label: "Notes",
    },
    {
      href: "/documents",
      icon: "📄",
      label: "Documents",
    },
    
    {
        href: "/profile",
        icon: "👤",
        label: "Profile",
    },
    {
        href: "/notifications",
        icon: "🔔",
        label: "Notifications",
    },
    {
      href: "/settings",
      icon: "⚙️",
      label: "Settings",
    },
  ];

  return (
    <aside className="w-full lg:w-[240px] lg:shrink-0">

      <div className="dd-card overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

        {/* Mobile Menu Button */}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="dd-button flex w-full items-center justify-between px-5 py-4 lg:hidden"
        >
          <div className="flex items-center gap-3">

            <span className="dd-hover-icon text-lg">
              ☰
            </span>

            <span className="font-semibold text-white">
              Menu
            </span>

          </div>

          <span
            className={`text-slate-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>

        </button>

        {/* Desktop */}

        <div className="hidden p-4 lg:block">

          <p className="mb-3 px-3 text-xs uppercase tracking-wider text-slate-500">
            Menu
          </p>

          <SidebarLinks
            menuItems={menuItems}
          />

          <div className="mt-4 border-t border-slate-800 pt-4">
            <LogoutButton />
          </div>

        </div>

        {/* Mobile */}

        {open && (
          <div className="border-t border-slate-800 p-4 lg:hidden">

            <p className="mb-3 px-3 text-xs uppercase tracking-wider text-slate-500">
              Navigation
            </p>

            <SidebarLinks
              menuItems={menuItems}
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

function SidebarLinks({
  menuItems,
  onNavigate,
}) {
  return (
    <div className="space-y-1">

      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="dd-link flex w-full items-center gap-3 rounded-xl px-3 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800 hover:text-white"
        >

          <span className="dd-hover-icon w-6 text-center">
            {item.icon}
          </span>

          <span>
            {item.label}
          </span>

        </Link>
      ))}

    </div>
  );
}