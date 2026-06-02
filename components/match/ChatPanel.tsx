"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { Car } from "@/types/car";
import type { ChatMessage, ChatResponse } from "@/types/chat";

function now() {
  return Date.now();
}

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

export function ChatPanel({ cars }: { cars: Car[] }) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      role: "assistant",
      content:
        "Ask me anything about these 3 cars — safety vs mileage, city driving, family trips, running costs, or which one fits you best.",
      at: now(),
    },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryable, setRetryable] = useState(false);
  const [retryPayload, setRetryPayload] = useState<{
    message: string;
    history: ChatMessage[];
  } | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const history = useMemo(
    () => messages.filter((m) => m.role === "user" || m.role === "assistant"),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const requestReply = async (payload: { message: string; history: ChatMessage[] }) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, cars }),
    });

    const json = (await response.json()) as ChatResponse & { error?: string };
    if (!response.ok) {
      const isRetryable = response.status === 503;
      setRetryable(isRetryable);
      setRetryPayload(isRetryable ? payload : null);
      throw new Error(json.error ?? "Chat failed. Please try again.");
    }

    setRetryable(false);
    setRetryPayload(null);
    return json.reply;
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || loading) return;

    setError(null);
    setRetryable(false);
    setRetryPayload(null);
    setLoading(true);

    const userMessage: ChatMessage = { role: "user", content: text, at: now() };
    const payload = { message: text, history: history.concat(userMessage) };

    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    try {
      const reply = await requestReply(payload);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, at: now() }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const retry = async () => {
    if (!retryPayload || loading) return;

    setError(null);
    setLoading(true);

    try {
      const reply = await requestReply(retryPayload);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, at: now() }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 shadow-xl shadow-black/30 backdrop-blur sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">
            Expert assistant
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            Chat about your shortlisted cars — no jargon, just clarity.
          </p>
        </div>
        <span className="hidden rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400 sm:inline">
          {cars.map((c) => c.name).join(" • ")}
        </span>
      </div>

      <div className="flex h-[340px] flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, idx) => (
            <div
              key={`${m.role}-${m.at ?? idx}`}
              className={cx(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cx(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-zinc-950"
                    : "border border-zinc-800 bg-zinc-950/40 text-zinc-200",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-400">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
                  Thinking…
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-zinc-800 bg-zinc-950/30 p-3">
          {error && (
            <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              <span>{error}</span>
              {retryable && (
                <button
                  type="button"
                  onClick={() => void retry()}
                  className="shrink-0 rounded-full border border-red-500/30 bg-zinc-950/40 px-3 py-1 text-[11px] font-semibold text-red-200 transition hover:bg-red-500/10"
                >
                  Retry
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              disabled={loading}
              className="h-11 flex-1 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              placeholder="Ask: Which one is best for city + weekend trips?"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={loading || !draft.trim()}
              className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 px-5 text-sm font-semibold text-zinc-950 transition hover:from-cyan-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

