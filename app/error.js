"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    console.error("DIGITALDOST GLOBAL ERROR:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 text-4xl">
          ⚠️
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-red-400">
          DigitalDost
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          An unexpected error occurred. Please try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Try Again
        </button>

        <button
          type="button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="ml-3 rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        >
          Dashboard
        </button>
      </div>
    </main>
  );
}