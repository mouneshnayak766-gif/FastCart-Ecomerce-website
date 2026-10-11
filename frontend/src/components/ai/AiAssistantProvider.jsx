import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import AiChatOverlay from "./AiChatOverlay";
import { AiCtx } from "./AiAssistantContext";
import useAiChat from "./useAiChat";

/**
 * Mount once inside the Router so the Navbar and page search bars share one chat.
 * Owns the chat + overlay so every <AiSearchBar /> (navbar, homepage, mobile) shares one conversation.
 * `language` = your LanguageContext value: "en" | "hi" | "kn".
 */
export default function AiAssistantProvider({ language = "en", children }) {
  const [isOpen, setOpen] = useState(false);
  const chat = useAiChat(language);
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <AiCtx.Provider value={value}>
      {children}
      {isOpen && createPortal(<AiChatOverlay chat={chat} onClose={close} />, document.body)}
    </AiCtx.Provider>
  );
}
