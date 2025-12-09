const jwt = require("jsonwebtoken");

/**
 * Configure Socket.IO
 * 
 * Sets up authentication middleware, connection handling, and event listeners.
 * Provides helper methods to emit events to specific users or conversations.
 * 
 * @param {Object} io - Socket.IO server instance
 * @returns {Object} Helper methods { emitToUser, emitToConversation }
 */
function configureSocket(io) {
  const onlineUsers = new Map();

  // Middleware: Authenticate Socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id, role: payload.role };
      return next();
    } catch (error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { id: userId } = socket.user;
    onlineUsers.set(userId.toString(), socket.id);
    socket.join(userId.toString());

    socket.on("joinConversation", (conversationId) => {
      if (conversationId) {
        socket.join(conversationId.toString());
      }
    });

    socket.on("leaveConversation", (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId.toString());
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId.toString());
    });
  });

  return {
    emitToUser(userId, event, payload) {
      io.to(userId.toString()).emit(event, payload);
    },
    emitToConversation(conversationId, event, payload) {
      io.to(conversationId.toString()).emit(event, payload);
    },
  };
}

module.exports = configureSocket;
