"use client";

import { useEffect, useState } from "react";

export default function Greeting({ name = "" }) {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    function updateGreeting() {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good Afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    }

    updateGreeting();

    const interval = setInterval(
      updateGreeting,
      60 * 1000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  const firstName =
    name?.trim()?.split(/\s+/)[0] || "there";

  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        {greeting}, {firstName}{" "}
        <span className="inline-block">👋</span>
      </h1>

      <p className="mt-2 text-sm text-slate-400 sm:text-base">
        Welcome to your DigitalDost workspace.
      </p>
    </div>
  );
}