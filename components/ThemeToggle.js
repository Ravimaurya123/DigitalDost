"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [lightMode, setLightMode] =
    useState(false);

  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        "digitaldost-theme"
      );

    if (savedTheme === "light") {
      document.documentElement.classList.add(
        "light-mode"
      );

      setLightMode(true);
    }
  }, []);

  function toggleTheme() {
    const newLightMode = !lightMode;

    setLightMode(newLightMode);

    if (newLightMode) {
      document.documentElement.classList.add(
        "light-mode"
      );

      localStorage.setItem(
        "digitaldost-theme",
        "light"
      );
    } else {
      document.documentElement.classList.remove(
        "light-mode"
      );

      localStorage.setItem(
        "digitaldost-theme",
        "dark"
      );
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={
        lightMode
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-lg transition hover:border-cyan-500 hover:bg-slate-800"
    >
      {lightMode ? "🌙" : "☀️"}
    </button>
  );
}