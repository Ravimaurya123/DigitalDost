"use client";

import { useEffect, useState } from "react";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");

  // FETCH NOTES
  async function fetchNotes() {
    try {
      setLoading(true);

      const response = await fetch("/api/notes", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
      } else {
        setMessage(data.message || "Failed to load notes");
      }
    } catch (error) {
      console.error("FETCH NOTES ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  // CREATE NOTE
  async function createNote(e) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Please enter title and content");
      return;
    }

    try {
      setCreating(true);
      setMessage("");

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotes((prev) => [data.note, ...prev]);

        setTitle("");
        setContent("");

        setMessage("Note created successfully!");
      } else {
        setMessage(data.message || "Failed to create note");
      }
    } catch (error) {
      console.error("CREATE NOTE ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  // START EDIT
  function startEdit(note) {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // CANCEL EDIT
  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setContent("");
    setMessage("");
  }

  // UPDATE NOTE
  async function updateNote(e) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setMessage("Please enter title and content");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(`/api/notes/${editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotes((prev) =>
          prev.map((note) =>
            note._id === editingId ? data.note : note
          )
        );

        setEditingId(null);
        setTitle("");
        setContent("");

        setMessage("Note updated successfully!");
      } else {
        setMessage(data.message || "Failed to update note");
      }
    } catch (error) {
      console.error("UPDATE NOTE ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  // DELETE NOTE
  async function deleteNote(noteId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(noteId);
      setMessage("");

      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setNotes((prev) =>
          prev.filter((note) => note._id !== noteId)
        );

        if (editingId === noteId) {
          cancelEdit();
        }

        setMessage("Note deleted successfully!");
      } else {
        setMessage(data.message || "Failed to delete note");
      }
    } catch (error) {
      console.error("DELETE NOTE ERROR:", error);
      setMessage("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            DigitalDost
          </h1>

          <p className="text-xs text-slate-500">
            Smart Notes
          </p>
        </div>

        <a
          href="/dashboard"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        >
          ← Dashboard
        </a>
      </header>

      <section className="mx-auto max-w-6xl p-6 md:p-10">
        {/* PAGE TITLE */}
        <div className="mb-8">
          <p className="text-sm text-cyan-400">
            SMART NOTES
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Your Notes 📝
          </h2>

          <p className="mt-2 text-slate-400">
            Capture your ideas, study notes and important information.
          </p>
        </div>

        {/* CREATE / EDIT FORM */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">
              {editingId ? "Edit Note" : "Create New Note"}
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={editingId ? updateNote : createNote}
            className="mt-5 space-y-4"
          >
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Note Title
              </label>

              <input
                type="text"
                placeholder="Enter note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Note Content
              </label>

              <textarea
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={creating || saving}
                className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating
                  ? "Creating..."
                  : saving
                  ? "Saving..."
                  : editingId
                  ? "💾 Save Changes"
                  : "➕ Create Note"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-slate-700 px-6 py-3 text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* MESSAGE */}
            {message && (
              <p className="text-sm text-cyan-400">
                {message}
              </p>
            )}
          </form>
        </div>

        {/* NOTES LIST */}
        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold">
                My Notes
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {notes.length} note
                {notes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* LOADING */}
          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">
                Loading notes...
              </p>
            </div>
          )}

          {/* EMPTY */}
          {!loading && notes.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <div className="text-5xl">📝</div>

              <h4 className="mt-4 text-lg font-semibold">
                No notes yet
              </h4>

              <p className="mt-2 text-sm text-slate-500">
                Create your first note above.
              </p>
            </div>
          )}

          {/* NOTES */}
          {!loading && notes.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note) => (
                <div
                  key={note._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-lg font-semibold text-white">
                      {note.title}
                    </h4>

                    <span className="text-xl">
                      📝
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {note.content}
                  </p>

                  <div className="mt-5 border-t border-slate-800 pt-4">
                    <p className="text-xs text-slate-600">
                      Created{" "}
                      {new Date(
                        note.createdAt
                      ).toLocaleDateString()}
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => startEdit(note)}
                        className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => deleteNote(note._id)}
                        disabled={deletingId === note._id}
                        className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === note._id
                          ? "Deleting..."
                          : "🗑️ Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
