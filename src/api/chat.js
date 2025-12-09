/**
 * Chat API
 */

import httpClient from "./httpClient";

/**
 * Get all conversations for current user
 */
export const getConversations = async () => {
  const { data } = await httpClient.get("/api/chat/conversations");
  return data;
};

/**
 * Start or get existing conversation
 * @param {Object} params - { participantId, jobId }
 */
export const startConversation = async ({ participantId, jobId }) => {
  const { data } = await httpClient.post("/api/chat/start", {
    participantId,
    jobId,
  });
  return data;
};

/**
 * Get messages for a conversation
 */
export const getMessages = async (conversationId) => {
  const { data } = await httpClient.get(`/api/chat/conversations/${conversationId}`);
  return data;
};

/**
 * Send a message
 * @param {Object} params - { conversationId, body }
 */
export const sendMessage = async ({ conversationId, body }) => {
  const { data } = await httpClient.post(
    `/api/chat/conversations/${conversationId}`,
    { body }
  );
  return data;
};

/**
 * Delete a conversation
 */
export const deleteConversation = async (conversationId) => {
  const { data } = await httpClient.delete(`/api/chat/conversations/${conversationId}`);
  return data;
};

