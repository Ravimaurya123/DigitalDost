"use client";

import { useEffect, useState } from "react";

export default function Greeting() {
  const [name, setName] = useState("");
  const [greeting, setGreeting] = useState("");

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good Evening";
    }

    return "Good Night";
  }

  useEffect(() => {
    setGreeting(getGreeting());

    async function loadUser() {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setName(data.user?.name || "");
        }
      } catch (error) {
        console.error(
          "GREETING USER ERROR:",
          error
        );
      }
    }

    loadUser();

    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const firstName =
    name.trim().split(/\s+/)[0] || "there";

  return (
    <div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">
        {greeting}, {firstName} 👋
      </h1>

      <p className="mt-2 text-sm text-slate-400 sm:text-base">
        Manage your digital life from one place.
      </p>
    </div>
  );
}