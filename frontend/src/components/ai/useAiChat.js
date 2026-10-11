import { useCallback, useEffect, useState } from "react";
import { sendChat, confirmAction, cancelAction } from "../../service/aiApi";

const newId = () =>
  crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const load = (key, fallback) => {
  try {
    const v = sessionStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const errorText = (err) => {
  const s = err?.response?.status;
  if (s === 429) return "You're sending messages too quickly. Please wait a moment and try again.";
  if (s === 401) return "Please log in to do that.";
  if (s === 503) return "FastCart AI is offline right now. Please try again shortly.";
  if (s === 400) return "I couldn't process that message. Try rephrasing it.";
  return "Something went wrong. Please try again.";
};

export default function useAiChat(language = "en") {
  const lang = ["en", "hi", "kn"].includes(language) ? language : "en";

  const [conversationId, setConversationId] = useState(() => {
    const id = sessionStorage.getItem("fc_ai_cid") || newId();
    sessionStorage.setItem("fc_ai_cid", id);
    return id;
  });
  const [messages, setMessages] = useState(() => load("fc_ai_msgs", []));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem("fc_ai_msgs", JSON.stringify(messages.slice(-60)));
    } catch {
      /* storage full or blocked: ignore */
    }
  }, [messages]);

  const push = (m) => setMessages((prev) => [...prev, { id: newId(), ...m }]);

  const send = useCallback(
    async (text) => {
      const msg = text.trim();
      if (!msg || loading) return;
      push({ role: "user", text: msg });
      setLoading(true);
      try {
        const data = await sendChat(conversationId, msg, lang);
        push({
          role: "ai",
          text: data.reply,
          products: data.products || [],
          pending: data.pendingAction || null,
        });
      } catch (err) {
        push({ role: "ai", text: errorText(err), error: true });
      } finally {
        setLoading(false);
      }
    },
    [conversationId, loading, lang]
  );

  const clearPending = (msgId) =>
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, pending: null } : m)));

  const confirm = useCallback(async (msgId, actionId) => {
    clearPending(msgId);
    try {
      const data = await confirmAction(actionId);
      push({ role: "ai", text: data.message });
      // Refresh your cart badge: window.addEventListener("cart:updated", ...)
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      push({ role: "ai", text: errorText(err), error: true });
    }
  }, []);

  const cancel = useCallback(async (msgId, actionId) => {
    clearPending(msgId);
    try {
      await cancelAction(actionId);
    } catch {
      /* expires on its own */
    }
    push({ role: "ai", text: "Okay, I cancelled that." });
  }, []);

  const reset = useCallback(() => {
    const id = newId();
    sessionStorage.setItem("fc_ai_cid", id);
    sessionStorage.removeItem("fc_ai_msgs");
    setConversationId(id);
    setMessages([]);
  }, []);

  return { messages, loading, send, confirm, cancel, reset };
}
