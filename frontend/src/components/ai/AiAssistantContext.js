import { createContext, useContext } from "react";

export const AiCtx = createContext(null);

export function useAiAssistant() {
  const context = useContext(AiCtx);
  if (!context) throw new Error("Wrap your layout in <AiAssistantProvider>");
  return context;
}
