"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const [search, setSearch] = useState("");

  const fileInputRef = useRef(null);

  async function fetchDocuments() {
    try {
      setFetching(true);
      setError("");

      const response = await fetch("/api/documents", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setError(data.message || "Failed to fetch documents.");
      }
    } catch (error) {
      console.error("FETCH DOCUMENTS ERROR:", error);
      setError("Something went wrong while loading documents.");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("PDF size must be less than 10 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function handleUpload(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to upload PDF.");
        return;
      }

      setMessage("PDF uploaded successfully! 🎉");
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchDocuments();
    } catch (error) {
      console.error("UPLOAD PDF ERROR:", error);
      setError("Something went wrong while uploading.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAskAI() {
    setError("");
    setAnswer("");

    if (!selectedDocument) {
      setError("Please select a document.");
      return;
    }

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setAsking(true);

      const response = await fetch(
        `/api/documents/${selectedDocument._id}/ask`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to get AI answer.");
        return;
      }

      setAnswer(data.answer || "");
    } catch (error) {
      console.error("ASK AI ERROR:", error);
      setError("Something went wrong while asking AI.");
    } finally {
      setAsking(false);
    }
  }

  function openAskAI(document) {
    setSelectedDocument(document);
    setQuestion("");
    setAnswer("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeAskAI() {
    setSelectedDocument(null);
    setQuestion("");
    setAnswer("");
    setError("");
  }

  function formatFileSize(bytes) {
    if (!bytes) return "0 KB";

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const filteredDocuments = documents.filter((document) =>
    document.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
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
        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wider text-cyan-400">
            Document Assistant
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Documents 📄
          </h1>

          <p className="mt-2 max-w-2xl text-slate-400">
            Upload your PDFs and use AI to understand and ask questions
            about them.
          </p>
        </div>

        {/* STATS */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon="📄"
            label="Documents"
            value={documents.length}
          />

          <StatCard
            icon="🤖"
            label="AI Ready"
            value={documents.length}
          />

          <div className="dd-card col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:col-span-1">
            <div className="dd-hover-icon mb-3 text-xl">
              💡
            </div>

            <p className="text-xs text-slate-500">
              Supported
            </p>

            <p className="mt-1 text-sm font-medium text-slate-200">
              PDF files up to 10 MB
            </p>
          </div>
        </div>

        {/* GLOBAL ERROR */}
        {error && (
          <div className="dd-card mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <div className="flex items-start gap-3">
              <span className="dd-hover-icon">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {message && (
          <div className="dd-card mb-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <div className="flex items-center gap-3">
              <span className="dd-hover-icon">✓</span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* ASK AI PANEL */}
        {selectedDocument && (
          <section className="dd-card mb-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-cyan-400/[0.03]">
            <div className="border-b border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="dd-hover-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-2xl">
                    📄
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-cyan-400">
                      AI Document Assistant
                    </p>

                    <h2 className="mt-1 truncate font-semibold text-white">
                      {selectedDocument.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeAskAI}
                  className="dd-button flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <label
                htmlFor="document-question"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Ask a question about this document
              </label>

              <textarea
                id="document-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Example: What is this document about?"
                rows={4}
                className="dd-input w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-sm leading-6 text-white outline-none placeholder:text-slate-600"
              />

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleAskAI}
                  disabled={asking || !question.trim()}
                  className="dd-button rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking ? "🤖 Thinking..." : "🤖 Ask AI"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setQuestion(
                      "What is this document mainly about?"
                    )
                  }
                  disabled={asking}
                  className="dd-button rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-300 disabled:opacity-50"
                >
                  Use Example
                </button>
              </div>

              {/* AI ANSWER */}
              {answer && (
                <div className="dd-card mt-6 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="dd-hover-icon flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                      🤖
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        AI Answer
                      </h3>

                      <p className="text-xs text-slate-500">
                        Based on your uploaded document
                      </p>
                    </div>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* UPLOAD + DOCUMENTS */}
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* UPLOAD */}
          <section className="dd-card h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="mb-5">
              <div className="dd-hover-icon mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-2xl">
                📤
              </div>

              <h2 className="text-xl font-semibold">
                Upload PDF
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload a PDF and DigitalDost will extract its text for
                AI-powered questions.
              </p>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <label
                htmlFor="pdf-file"
                className="dd-card flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/60 px-5 py-8 text-center"
              >
                <span className="dd-hover-icon text-4xl">
                  📄
                </span>

                <span className="mt-3 text-sm font-medium text-slate-200">
                  Choose a PDF file
                </span>

                <span className="mt-1 text-xs text-slate-600">
                  Maximum size: 10 MB
                </span>

                <input
                  ref={fileInputRef}
                  id="pdf-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="dd-card rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
                  <div className="flex items-start gap-3">
                    <span className="dd-hover-icon text-xl">
                      📄
                    </span>

                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-cyan-400">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="dd-button w-full rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Uploading..." : "📤 Upload PDF"}
              </button>
            </form>
          </section>

          {/* DOCUMENT LIST */}
          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  My Documents
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your uploaded PDF documents
                </p>
              </div>

              <span className="dd-button w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
                {documents.length}{" "}
                {documents.length === 1
                  ? "document"
                  : "documents"}
              </span>
            </div>

            {/* SEARCH */}
            <div className="mb-5">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search documents..."
                className="dd-input w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600"
              />
            </div>

            {fetching ? (
              <LoadingState text="Loading documents..." />
            ) : filteredDocuments.length === 0 ? (
              <EmptyState
                icon="📄"
                title={
                  documents.length === 0
                    ? "No documents yet"
                    : "No documents found"
                }
                text={
                  documents.length === 0
                    ? "Upload your first PDF to start using Document AI."
                    : "Try searching with another document name."
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredDocuments.map((document) => (
                  <div
                    key={document._id}
                    className="dd-card group rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="dd-hover-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-2xl">
                          📄
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-white">
                            {document.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatFileSize(document.size)} •{" "}
                            {formatDate(document.createdAt)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAskAI(document)}
                        className="dd-button w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-medium text-cyan-400 sm:w-auto"
                      >
                        🤖 Ask AI
                      </button>
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

function StatCard({ icon, label, value }) {
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

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}