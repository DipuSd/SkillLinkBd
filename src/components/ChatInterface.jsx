import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import {
  getMessages,
  sendMessage,
  startConversation,
  deleteConversation,
  getConversations,
} from "../api/chat";
import { useAuth } from "../context/AuthContext";

const socketUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:4000";

function ChatInterface() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const startConversationOnceRef = useRef(null);

  const conversationsQuery = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: getConversations,
    enabled: Boolean(token),
  });

  const conversations = useMemo(
    () => conversationsQuery.data?.conversations ?? [],
    [conversationsQuery.data]
  );

  const messagesQuery = useQuery({
    queryKey: ["chat", "messages", selectedConversationId],
    queryFn: () => getMessages(selectedConversationId),
    enabled: Boolean(selectedConversationId),
    refetchOnWindowFocus: false,
  });

  const messages = messagesQuery.data?.messages ?? [];

  const startConversationMutation = useMutation({
    mutationFn: startConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      const id = data.conversation?._id || data.conversation?.id;
      setSelectedConversationId(id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (_data, variables) => {
      setNewMessage("");
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      setSelectedConversationId(null);
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
  });

  const activeConversation = useMemo(() => {
    if (!selectedConversationId) return null;
    return (
      conversations.find((conv) => {
        const id = conv._id || conv.id;
        return id === selectedConversationId;
      }) ?? null
    );
  }, [conversations, selectedConversationId]);

  const conversationPartner = useMemo(() => {
    if (!activeConversation || !user?._id) return null;
    return (
      activeConversation.participants?.find(
        (participant) => (participant._id || participant.id) !== user._id
      ) ?? null
    );
  }, [activeConversation, user?._id]);

  const handleSelectConversation = useCallback((conversationId) => {
    setSelectedConversationId(conversationId);
  }, []);

  const handleSend = useCallback(() => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      body: newMessage.trim(),
    });
  }, [newMessage, selectedConversationId, sendMessageMutation]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(socketUrl, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on("chat:message", (message) => {
      const conversationId = message?.conversation || selectedConversationId;
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: ["chat", "messages", conversationId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    });

    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, queryClient, selectedConversationId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return undefined;
    if (!selectedConversationId) return undefined;

    socket.emit("joinConversation", selectedConversationId);

    return () => {
      socket.emit("leaveConversation", selectedConversationId);
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (!conversations.length || selectedConversationId) return;
    const firstConversation = conversations[0];
    if (firstConversation) {
      setSelectedConversationId(firstConversation._id || firstConversation.id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    const targetUserId = searchParams.get("user");
    if (!targetUserId || !token) {
      startConversationOnceRef.current = null;
      return;
    }

    const existingConversation = conversations.find((conversation) =>
      conversation.participants?.some(
        (participant) => (participant._id || participant.id) === targetUserId
      )
    );

    if (existingConversation) {
      const id = existingConversation._id || existingConversation.id;
      setSelectedConversationId(id);
      return;
    }

    if (startConversationOnceRef.current === targetUserId) {
      return;
    }

    startConversationOnceRef.current = targetUserId;
    startConversationMutation.mutate({
      participantId: targetUserId,
      jobId: searchParams.get("jobId") || undefined,
    });
  }, [searchParams, conversations, token, startConversationMutation]);

  const unreadCount = useMemo(() => {
    if (!activeConversation || !user?._id) return 0;
    const map = activeConversation.unreadCount || {};
    return map[user._id] || 0;
  }, [activeConversation, user?._id]);

  return (
    <div className="flex flex-col lg:flex-row bg-gray-50 h-[calc(100vh-5rem)] rounded-2xl shadow-sm m-4 overflow-hidden border border-gray-200">
      <div className="w-full lg:w-1/4 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white p-4 overflow-y-auto max-h-[50vh] lg:max-h-full space-y-4">
        <input
          type="text"
          placeholder="Search conversations..."
          className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none"
          onChange={(event) => {
            const term = event.target.value.toLowerCase();
            queryClient.setQueryData(["chat", "conversations"], (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                conversations: conversations.map((conversation) => ({
                  ...conversation,
                  _hidden:
                    term && conversation.participants?.every((participant) => {
                      const name = participant.name?.toLowerCase() ?? "";
                      return !name.includes(term);
                    }),
                })),
              };
            });
          }}
        />
        {conversationsQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-16 bg-gray-100 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-gray-400 text-sm">No conversations yet.</p>
        ) : (
          conversations
            .filter((conversation) => !conversation._hidden)
            .map((conversation) => {
              const id = conversation._id || conversation.id;
              const partner = conversation.participants?.find(
                (participant) => (participant._id || participant.id) !== user?._id
              );
              const lastMessage = conversation.lastMessage;
              const isSelected = id === selectedConversationId;

              const unreadForUser =
                conversation.unreadCount?.[user?._id] ?? 0;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectConversation(id)}
                  className={`w-full flex justify-between items-center p-3 rounded-lg transition-all duration-150 text-left ${
                    isSelected
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-blue-50"
                  }`}
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {partner?.name ?? "Unknown"}
                    </h3>
                    <p className="text-gray-500 text-sm truncate">
                      {lastMessage?.body ?? "Start chatting"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400 text-right space-y-2">
                    <p>
                      {lastMessage?.createdAt
                        ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </p>
                    {unreadForUser > 0 ? (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadForUser}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })
        )}
      </div>

      <div className="flex-1 flex flex-col h-full bg-gray-50">
        {activeConversation ? (
          <>
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
              <div>
                <h2 className="font-semibold text-lg text-gray-800">
                  {conversationPartner?.name ?? "Conversation"}
                </h2>
                <p className="text-sm text-green-600">
                  {unreadCount ? `${unreadCount} unread` : "Online"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
                    deleteConversationMutation.mutate(selectedConversationId);
                  }
                }}
                className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
              >
                Delete Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 space-y-3">
              {messagesQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-12 bg-gray-100 rounded-xl animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <p className="text-gray-400 text-sm">Say hello to start the conversation.</p>
              ) : (
                messages.map((message) => {
                  const fromSelf =
                    (message.sender?._id || message.sender?.id) === user?._id;
                  return (
                    <div
                      key={message._id || message.id}
                      className={`flex ${
                        fromSelf ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                          fromSelf
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                        }`}
                      >
                        <p>{message.body}</p>
                        <p
                          className={`text-xs mt-1 ${
                            fromSelf ? "text-blue-100" : "text-gray-400"
                          }`}
                        >
                          {message.createdAt
                            ? new Date(message.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {activeConversation?.job &&
            ["completed", "cancelled", "rejected", "withdrawn"].includes(
              activeConversation.job.status
            ) ? (
              <div className="px-4 py-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
                <p className="font-semibold">
                  This conversation is related to a job that has ended.
                </p>
                <p>Chat is no longer available for this job.</p>
              </div>
            ) : (
              <div className="flex items-center px-4 py-3 bg-white border-t border-gray-200">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-400 outline-none"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sendMessageMutation.isPending}
                  className="ml-3 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {sendMessageMutation.isPending ? "Sending..." : "Send"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;
