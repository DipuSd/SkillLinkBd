import httpClient from "./httpClient";

export const getConversations = async () => {
  const { data } = await httpClient.get("/api/chat/conversations");
  return data;
};

export const startConversation = async ({ participantId, jobId }) => {
  const { data } = await httpClient.post("/api/chat/start", {
    participantId,
    jobId,
  });
  return data;
};

export const getMessages = async (conversationId) => {
  const { data } = await httpClient.get(`/api/chat/conversations/${conversationId}`);
  return data;
};

export const sendMessage = async ({ conversationId, body }) => {
  const { data } = await httpClient.post(
    `/api/chat/conversations/${conversationId}`,
    { body }
  );
  return data;
};

