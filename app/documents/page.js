"use client";

import { useEffect, useState } from "react";

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

  async function fetchDocuments() {
    try {
      setFetching(true);
      setError("");

      const response = await fetch("/api/documents", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents);
      } else {
        setError(
          data.message || "Failed to fetch documents."
        );
      }
    } catch (error) {
      console.error(
        "FETCH DOCUMENTS ERROR:",
        error
      );

      setError("Something went wrong.");
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
        setError(
          data.message || "Failed to upload PDF."
        );
        return;
      }

      setMessage(
        "PDF uploaded successfully! 📄"
      );

      setFile(null);

      const fileInput =
        document.getElementById("pdf-file");

      if (fileInput) {
        fileInput.value = "";
      }

      await fetchDocuments();
    } catch (error) {
      console.error(
        "UPLOAD PDF ERROR:",
        error
      );

      setError("Something went wrong.");
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
        setError(
          data.message ||
            "Failed to get AI answer."
        );
        return;
      }

      setAnswer(data.answer);
    } catch (error) {
      console.error(
        "ASK AI ERROR:",
        error
      );

      setError(
        "Something went wrong while asking AI."
      );
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
  }

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 KB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }

    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  function formatDate(date) {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <a
            href="/dashboard"
            className="text-cyan-400 hover:text-cyan-300 text-sm"
          >
            ← Back to Dashboard
          </a>

          <h1 className="text-4xl font-bold mt-4">
            Documents 📄
          </h1>

          <p className="text-slate-400 mt-2">
            Upload your PDF documents and ask AI
            questions about them.
          </p>
        </div>

        {/* Ask AI */}
        {selectedDocument && (
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 mb-8">

            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-slate-400">
                  Asking AI about
                </p>

                <h2 className="text-xl font-semibold mt-1">
                  📄 {selectedDocument.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeAskAI}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label
                  htmlFor="document-question"
                  className="block text-sm text-slate-300 mb-2"
                >
                  Ask a question
                </label>

                <textarea
                  id="document-question"
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  placeholder="Example: What is this document about?"
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleAskAI}
                disabled={asking}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
              >
                {asking
                  ? "🤖 Thinking..."
                  : "🤖 Ask AI"}
              </button>

              {answer && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">
                      🤖
                    </span>

                    <h3 className="font-semibold">
                      AI Answer
                    </h3>
                  </div>

                  <p className="text-slate-300 leading-7 whitespace-pre-wrap">
                    {answer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">
            Upload PDF
          </h2>

          <p className="text-slate-400 text-sm mb-5">
            Upload a PDF file up to 10 MB.
          </p>

          <form
            onSubmit={handleUpload}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="pdf-file"
                className="block text-sm text-slate-300 mb-2"
              >
                Select PDF
              </label>

              <input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 file:mr-4 file:bg-cyan-500 file:text-slate-950 file:border-0 file:px-4 file:py-2 file:rounded-lg file:font-medium"
              />
            </div>

            {file && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-300">
                  Selected file
                </p>

                <p className="text-cyan-400 font-medium mt-1">
                  📄 {file.name}
                </p>

                <p className="text-slate-500 text-sm mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-sm">
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 text-sm">
                  {message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading
                ? "Uploading..."
                : "📤 Upload PDF"}
            </button>
          </form>
        </div>

        {/* Documents */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-semibold">
                My Documents
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Your uploaded PDF documents
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {documents.length} document
              {documents.length !== 1
                ? "s"
                : ""}
            </span>
          </div>

          {fetching ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-400">
                Loading documents...
              </p>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">
                📄
              </div>

              <h3 className="text-xl font-semibold">
                No documents yet
              </h3>

              <p className="text-slate-400 mt-2">
                Upload your first PDF document above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((document) => (
                <div
                  key={document._id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-2xl">
                        📄
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg">
                          {document.name}
                        </h3>

                        <p className="text-slate-500 text-sm mt-1">
                          {formatFileSize(
                            document.size
                          )}
                          {" • "}
                          {formatDate(
                            document.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openAskAI(document)
                      }
                      className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      🤖 Ask AI
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}