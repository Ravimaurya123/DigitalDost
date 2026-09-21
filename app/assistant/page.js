"use client";

import { useState } from "react";

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm DigitalDost 🤖. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();

    if (!input.trim() || loading) {
      return;
    }

    const userMessage = input.trim();

    setInput("");

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
      },
    ]);

    try {
      setLoading(true);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.message || "Sorry, something went wrong.",
          },
        ]);
      }
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to AI. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* HEADER */}
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-cyan-400">
            DigitalDost
          </h1>

          <p className="text-xs text-slate-500">
            AI Assistant
          </p>
        </div>

        <a
          href="/dashboard"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
        >
          ← Dashboard
        </a>
      </header>

      {/* CHAT AREA */}
      <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col p-4 md:p-8">
        {/* TITLE */}
        <div className="mb-6">
          <p className="text-sm text-cyan-400">
            DIGITALDOST AI
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            How can I help you? 🤖
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Ask questions, learn concepts, plan your work,
            or get help with your daily activities.
          </p>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-cyan-500 text-slate-950"
                    : "bg-slate-950 text-slate-200"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* LOADING */}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-slate-950 px-4 py-3">
                <p className="text-sm text-slate-500">
                  DigitalDost is thinking...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <form
          onSubmit={sendMessage}
          className="mt-4 flex gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask DigitalDost anything..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>

        {/* SUGGESTIONS */}
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Suggestion
            text="Explain binary search"
            onClick={() => setInput("Explain binary search in simple words")}
          />

          <Suggestion
            text="Give me a study plan"
            onClick={() =>
              setInput(
                "Create a study plan for my DSA preparation"
              )
            }
          />

          <Suggestion
            text="Help with Java"
            onClick={() =>
              setInput(
                "Help me understand Java programming"
              )
            }
          />
        </div>
      </section>
    </main>
  );
}

function Suggestion({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-left text-sm text-slate-400 transition hover:border-cyan-500 hover:text-cyan-400"
    >
      {text}
    </button>
  );
}