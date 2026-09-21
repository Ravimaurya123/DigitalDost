"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/notes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load notes.");
        return;
      }

      setNotes(data.notes || []);
    } catch (error) {
      console.error("LOAD NOTES ERROR:", error);
      setError("Something went wrong while loading notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function addNote(event) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Note title is required.");
      return;
    }

    if (!content.trim()) {
      setError("Note content is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create note.");
        return;
      }

      setTitle("");
      setContent("");

      setSuccess("Note created successfully.");
      await loadNotes();
    } catch (error) {
      console.error("CREATE NOTE ERROR:", error);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(note) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${note.title}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/notes/${note._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete note.");
        return;
      }

      setSuccess("Note deleted successfully.");
      await loadNotes();
    } catch (error) {
      console.error("DELETE NOTE ERROR:", error);
      setError("Failed to delete note.");
    }
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getPreview(content) {
    if (!content) return "";

    if (content.length <= 180) {
      return content;
    }

    return `${content.slice(0, 180)}...`;
  }

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    return (
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="dd-link text-2xl font-bold"
          >
            Digital<span className="text-cyan-400">Dost</span>
          </Link>

          <Link
            href="/dashboard"
            className="dd-button rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
            Personal Knowledge
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            My Notes
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Capture ideas, study notes and important information.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="dd-card mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="dd-card mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            {success}
          </div>
        )}

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total Notes"
            value={notes.length}
            icon="📝"
          />

          <StatCard
            label="Search Results"
            value={filteredNotes.length}
            icon="🔍"
          />

          <div className="dd-card col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-1">
            <div className="dd-hover-icon mb-3 text-xl">💡</div>

            <p className="text-xs text-slate-500">
              Tip
            </p>

            <p className="mt-1 text-sm font-medium text-slate-200">
              Keep your notes short and organized.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* CREATE NOTE */}
          <section className="dd-card h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold">
                Create New Note
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Save an idea or important information.
              </p>
            </div>

            <form onSubmit={addNote} className="space-y-4">
              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Note title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Java DSA Notes"
                  className="dd-input w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>

              {/* CONTENT */}
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Note content
                </label>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  rows={9}
                  className="dd-input w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
                />
              </div>

              {/* SAVE */}
              <button
                type="submit"
                disabled={saving}
                className="dd-button w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "📝 Save Note"}
              </button>
            </form>
          </section>

          {/* NOTES LIST */}
          <section>
            {/* SEARCH */}
            <div className="mb-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search notes by title or content..."
                className="dd-input w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>

            {/* STATES */}
            {loading ? (
              <LoadingState text="Loading notes..." />
            ) : filteredNotes.length === 0 ? (
              <EmptyState
                icon="📝"
                title="No notes found"
                text={
                  notes.length === 0
                    ? "Create your first note to start building your personal knowledge base."
                    : "Try searching for another keyword."
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredNotes.map((note) => (
                  <div
                    key={note._id}
                    className="dd-card group rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="dd-hover-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-lg">
                          📝
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-white">
                            {note.title}
                          </h3>

                          <p className="mt-1 text-xs text-slate-600">
                            {formatDate(note.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* DELETE */}
                      <button
                        onClick={() => deleteNote(note)}
                        className="dd-button rounded-lg px-2 py-2 text-xs text-red-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                      {getPreview(note.content)}
                    </p>

                    <div className="mt-5 border-t border-white/5 pt-4">
                      <span className="dd-link text-xs text-cyan-400">
                        Personal Note
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

/* =========================
   STAT CARD
========================= */

function StatCard({ label, value, icon }) {
  return (
    <div className="dd-card rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="dd-hover-icon mb-3 text-xl">
        {icon}
      </div>

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

/* =========================
   LOADING STATE
========================= */

function LoadingState({ text }) {
  return (
    <div className="dd-card rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
      <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

/* =========================
   EMPTY STATE
========================= */

function EmptyState({ icon, title, text }) {
  return (
    <div className="dd-card rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
      <div className="dd-hover-icon mb-4 text-4xl">
        {icon}
      </div>

      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}