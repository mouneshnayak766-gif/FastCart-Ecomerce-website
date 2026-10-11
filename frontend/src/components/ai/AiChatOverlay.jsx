import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AiIcon from "./AiIcon";
import AiProductCard from "./AiProductCard";

const SUGGESTIONS = [
  "Best phones under ₹20,000",
  "Compare two laptops for me",
  "Where is my latest order?",
  "Gift ideas under ₹1,500",
];

export default function AiChatOverlay({ chat, onClose }) {
  const { messages, loading, send, confirm, cancel, reset } = chat;
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    send(text);
    setText("");
  };

  // ADAPT: your product details route
  const view = (p) => {
    onClose();
    navigate(`/product/${p.id}`);
  };
  const add = (p) => send(`Add "${p.name}" (product id ${p.id}) to my cart`);

  return (
    <div role="dialog" aria-modal="true" aria-label="FastCart AI chat" className="fixed inset-0 z-[100] bg-black/60 sm:p-4">
      <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden bg-gray-50 dark:bg-gray-950 sm:h-full sm:rounded-2xl sm:border sm:border-gray-800 sm:shadow-2xl">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="rounded-full p-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-gray-900">
            <AiIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold leading-tight text-gray-900 dark:text-white">FastCart AI</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">{loading ? "Typing…" : "Shopping assistant"}</p>
          </div>
          <button
            onClick={reset}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            New chat
          </button>
        </header>

        {/* Messages */}
        <main className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {messages.length === 0 && (
            <div className="mx-auto max-w-sm pt-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-gray-900">
                <AiIcon className="h-7 w-7" />
              </div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">Ask FastCart AI</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Find products, compare them, track orders, or add items to your cart.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-amber-400/50 bg-white px-3 py-1.5 text-sm text-gray-800 hover:bg-amber-400/10 dark:bg-gray-900 dark:text-gray-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
                  m.role === "user"
                    ? "rounded-br-sm bg-amber-400 text-gray-900"
                    : m.error
                    ? "rounded-bl-sm bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "rounded-bl-sm bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                }`}
              >
                {m.text}
              </div>

              {m.products?.length > 0 && (
                <div className="mt-2 flex w-full max-w-full gap-3 overflow-x-auto pb-2">
                  {m.products.map((p) => (
                    <AiProductCard key={p.id} product={p} onView={view} onAdd={add} />
                  ))}
                </div>
              )}

              {m.pending && (
                <div className="mt-2 max-w-[85%] rounded-2xl border border-amber-400/60 bg-amber-50 p-3 text-sm dark:bg-amber-400/10">
                  <p className="font-medium text-gray-900 dark:text-amber-200">Please confirm</p>
                  <p className="mt-0.5 text-gray-700 dark:text-gray-300">{m.pending.summary}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => confirm(m.id, m.pending.id)}
                      className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-amber-300"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => cancel(m.id, m.pending.id)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm dark:bg-gray-800">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </main>

        {/* Composer */}
        <form
          onSubmit={submit}
          className="flex items-center gap-2 border-t border-gray-200 bg-white px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] dark:border-gray-800 dark:bg-gray-900"
        >
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Ask FastCart AI or search products"
            className="h-11 flex-1 rounded-xl bg-gray-100 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-amber-400 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            aria-label="Send"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-gray-900 hover:bg-amber-300 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M3 20l18-8L3 4v6l11 2-11 2z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
