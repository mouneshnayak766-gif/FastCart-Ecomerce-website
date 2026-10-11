// Reuse the application's configured Axios client and its JWT interceptors.
import api from "./api";

export const sendChat = (conversationId, message, language = "en") =>
  api.post("/ai/chat", { conversationId, message, language }).then((r) => r.data);

export const confirmAction = (actionId) =>
  api.post(`/ai/actions/${encodeURIComponent(actionId)}/confirm`).then((r) => r.data);

export const cancelAction = (actionId) =>
  api.post(`/ai/actions/${encodeURIComponent(actionId)}/cancel`).then((r) => r.data);
