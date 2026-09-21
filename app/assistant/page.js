"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const suggestions = [
  {
    title: "Explain Binary Search",
    description: "Learn a programming concept simply",
    prompt: "Explain binary search in simple words with an example",
    icon: "🔎",
  },
  {
    title: "Create Study Plan",
    description: "Plan your DSA preparation",
    prompt: "Create a practical study plan for my DSA preparation",
    icon: "📚",
  },
  {
    title: "Help With Java",
    description: "Understand Java programming",
    prompt: "Help me understand Java programming with simple examples",
    icon: "☕",
  },
  {
    title: "Career Guidance",
    description: "Improve your developer journey",
    prompt: "Give me a roadmap to become a software developer",
    icon: "🚀",
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm DigitalDost 🤖. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  function useSuggestion(prompt) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared. 👋 What would you like to talk about?",
      },
    ]);

    setInput("");
  }

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
            content: data.message || "Sorry, something went wrong.",
            isError: true,
          },
        ]);
      }
    } catch (error) {
      console.error("CHAT ERROR:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Unable to connect to AI. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="dd-card dd-hover-icon flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-xl">
              🤖
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Digital<span className="text-cyan-400">Dost</span>
              </h1>

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <p className="text-xs text-slate-500">
                  AI Assistant Online
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearChat}
              className="dd-button hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 sm:block"
            >
              Clear Chat
            </button>

            <Link
              href="/dashboard"
              className="dd-button dd-link rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl flex-col px-4 py-6 sm:px-6 lg:py-8">
        {/* HERO */}
        <div className="mb-6">
          <div className="dd-card mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-400">
            <span className="dd-hover-icon">✦</span>
            DIGITALDOST AI
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your personal AI assistant
            <span className="text-cyan-400">.</span>
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Ask questions, learn concepts, plan your work, solve problems and
            get help with your daily activities.
          </p>
        </div>

        {/* CHAT CARD */}
        <div className="dd-card flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/20">
          {/* CHAT HEADER */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="dd-hover-icon flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                🤖
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  DigitalDost AI
                </p>

                <p className="text-xs text-slate-500">
                  Powered by Gemini
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearChat}
              className="dd-button rounded-lg px-3 py-2 text-xs text-slate-500 sm:hidden"
            >
              Clear
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="mx-auto max-w-4xl space-y-5">
              {messages.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                />
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex max-w-[90%] items-end gap-3">
                    <div className="dd-hover-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                      🤖
                    </div>

                    <div className="dd-card rounded-2xl rounded-bl-md border border-white/10 bg-slate-900 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                          DigitalDost is thinking
                        </span>

                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400" />

                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />

                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* INPUT AREA */}
          <div className="border-t border-white/10 bg-slate-950/60 p-3 sm:p-4">
            <form
              onSubmit={sendMessage}
              className="mx-auto flex max-w-4xl gap-2 sm:gap-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask DigitalDost anything..."
                disabled={loading}
                className="dd-input min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-50 sm:rounded-2xl sm:px-5 sm:py-4"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="dd-button rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40 sm:rounded-2xl sm:px-6"
              >
                <span className="hidden sm:inline">
                  {loading ? "Thinking..." : "Send"}
                </span>

                <span className="sm:hidden">
                  {loading ? "..." : "➤"}
                </span>
              </button>
            </form>

            <p className="mx-auto mt-2 max-w-4xl text-center text-[11px] text-slate-600">
              DigitalDost AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>

        {/* SUGGESTIONS */}
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Try asking
            </p>

            <p className="hidden text-xs text-slate-600 sm:block">
              Click a suggestion to use it
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => useSuggestion(item.prompt)}
                className="dd-feature group rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
              >
                <div className="dd-hover-icon mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-lg transition group-hover:bg-cyan-400/20">
                  {item.icon}
                </div>

                <p className="text-sm font-semibold text-slate-200">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[92%] items-end gap-3 sm:max-w-[80%] ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`dd-hover-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isUser
              ? "bg-cyan-500 text-slate-950"
              : "bg-cyan-400/10"
          }`}
        >
          {isUser ? "👤" : "🤖"}
        </div>

        <div
          className={`dd-card rounded-2xl px-4 py-3 sm:px-5 sm:py-4 ${
            isUser
              ? "rounded-br-md bg-cyan-500 text-slate-950"
              : message.isError
              ? "rounded-bl-md border border-red-500/20 bg-red-500/10 text-red-300"
              : "rounded-bl-md border border-white/10 bg-slate-900 text-slate-200"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.content}
          </p>
        </div>
      </div>
    </div>
  );
}