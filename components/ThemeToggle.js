"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("digitaldost-theme");

    if (savedTheme === "light") {
      document.documentElement.classList.add("light-mode");
      setIsLight(true);
    } else {
      document.documentElement.classList.remove(
        "light-mode"
      );
      setIsLight(false);
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const html = document.documentElement;

    if (html.classList.contains("light-mode")) {
      html.classList.remove("light-mode");

      localStorage.setItem(
        "digitaldost-theme",
        "dark"
      );

      setIsLight(false);
    } else {
      html.classList.add("light-mode");

      localStorage.setItem(
        "digitaldost-theme",
        "light"
      );

      setIsLight(true);
    }
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg"
        aria-label="Theme"
      >
        🌙
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg transition hover:border-cyan-400 hover:bg-slate-800"
      title={
        isLight
          ? "Switch to Dark Mode"
          : "Switch to Light Mode"
      }
      aria-label={
        isLight
          ? "Switch to Dark Mode"
          : "Switch to Light Mode"
      }
    >
      {isLight ? "🌙" : "☀️"}
    </button>
  );
}