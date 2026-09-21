"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function GlobalSearch() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Ctrl + K / Cmd + K
  useEffect(() => {
    function handleKeyboard(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        setOpen(true);

        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }

      if (event.key === "Escape") {
        setOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
      }
    }

    document.addEventListener("keydown", handleKeyboard);

    return () => {
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  // Click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search API
  useEffect(() => {
    const value = query.trim();

    if (!value) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setResults(data.results || []);
          setSelectedIndex(-1);
        } else {
          setResults([]);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error("SEARCH ERROR:", error);
        setResults([]);
        setSelectedIndex(-1);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  function handleResultClick(result) {
    setOpen(false);
    setQuery("");
    setSelectedIndex(-1);

    router.push(result.url);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (results.length === 0) return;

      setSelectedIndex((current) => {
        if (current >= results.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (results.length === 0) return;

      setSelectedIndex((current) => {
        if (current <= 0) {
          return results.length - 1;
        }

        return current - 1;
      });
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  }

  function getIcon(type) {
    if (type === "task") return "✅";
    if (type === "note") return "📝";
    if (type === "reminder") return "🔔";
    if (type === "document") return "📄";

    return "🔎";
  }

  function getTypeLabel(type) {
    if (type === "task") return "Task";
    if (type === "note") return "Note";
    if (type === "reminder") return "Reminder";
    if (type === "document") return "Document";

    return "Result";
  }

  return (
    <div
      ref={searchRef}
      className="relative z-50 w-full max-w-xl"
    >
      {/* Search Input */}
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
          🔍
        </span>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks, notes, reminders, documents..."
          className="dd-input w-full rounded-2xl border border-slate-700 bg-slate-900/80 py-3 pl-11 pr-24 text-sm text-white outline-none placeholder:text-slate-500 backdrop-blur-md"
        />

        {/* Ctrl + K */}
        {!query && (
          <div className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 sm:flex">
            <kbd className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
              Ctrl
            </kbd>

            <kbd className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
              K
            </kbd>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          </div>
        )}

        {/* Clear */}
        {!loading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
              setSelectedIndex(-1);
            }}
            className="dd-hover-icon absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {open && query.trim() && (
        <div className="dd-card absolute left-0 right-0 mt-3 max-h-[420px] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              <div className="mb-3 text-2xl">🔍</div>
              Searching DigitalDost...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-3xl">🔎</div>

              <p className="mt-3 text-sm font-medium text-white">
                No results found
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Try another keyword.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Search Results
                </span>

                <span className="text-[10px] text-slate-600">
                  ↑ ↓ Navigate · Enter Open
                </span>
              </div>

              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => handleResultClick(result)}
                  className={`group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                    selectedIndex === index
                      ? "border border-cyan-500/30 bg-cyan-500/10"
                      : "border border-transparent hover:bg-slate-800/70"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`dd-hover-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${
                      selectedIndex === index
                        ? "border-cyan-500/30 bg-cyan-500/10"
                        : "border-slate-700 bg-slate-900"
                    }`}
                  >
                    {getIcon(result.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {result.title}
                      </p>

                      <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>

                    {result.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {result.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <span
                    className={`mt-2 text-xs transition-all ${
                      selectedIndex === index
                        ? "translate-x-1 text-cyan-400"
                        : "text-slate-600 group-hover:translate-x-1 group-hover:text-cyan-400"
                    }`}
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}