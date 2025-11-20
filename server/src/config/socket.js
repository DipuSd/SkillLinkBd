const jwt = require("jsonwebtoken");

function configureSocket(io) {
  const onlineUsers = new Map();

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
