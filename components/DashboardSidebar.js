"use client";

import { useState } from "react";
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
      href: "#",
      icon: "⚙️",
      label: "Settings",
    },
  ];

  return (
    <aside className="w-full lg:w-[240px] lg:shrink-0">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {/* Mobile Header */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-4 lg:hidden"
        >
          <div className="flex items-center gap-3">
            <span className="text-lg">☰</span>

            <span className="font-semibold text-white">
              Menu
            </span>
          </div>

          <span
            className={`text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        {/* Desktop Menu */}
        <div className="hidden p-4 lg:block">
          <p className="mb-3 px-3 text-xs uppercase tracking-wider text-slate-500">
            Menu
          </p>

          <SidebarLinks menuItems={menuItems} />

          <div className="mt-4 border-t border-slate-800 pt-4">
            <LogoutButton />
          </div>
        </div>

        {/* Mobile Menu */}
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
      {menuItems.map((item, index) => {
        const isDashboard = item.href === "/dashboard";

        return (
          <a
            key={index}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition ${
              isDashboard
                ? "bg-cyan-500/10 text-cyan-400"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <span className="w-6 text-center">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}