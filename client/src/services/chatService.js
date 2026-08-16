/**
 * services/chatService.js
 * API calls for the JanSewa AI Assistant chat widget.
 */

import api from "./api";

export const chatService = {
  // history: [{ role: "user" | "model", text: string }]
  sendMessage: (message, history) => api.post("/chat/message", { message, history }),
};
