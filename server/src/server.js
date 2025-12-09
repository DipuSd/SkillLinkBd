/**
 * Server Entry Point
 * 
 * Initializes the HTTP server with Socket.IO for real-time communication.
 * Connects to MongoDB and starts listening on the configured PORT.
 */

require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB = require("./config/db");
const configureSocket = require("./config/socket");

const PORT = process.env.PORT || 4000;

// Immediately Invoked Async Function to start the server
(async () => {
  try {
    // Step 1: Connect to MongoDB
    // eslint-disable-next-line no-console
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    // Step 2: Create HTTP server and Socket.IO instance
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin:
          process.env.CLIENT_URL?.split(",") ?? "http://localhost:5173",
      },
    });

    // Step 3: Configure Socket.IO and attach to Express app
    const socketApi = configureSocket(io);
    app.set("socket", socketApi);

    // Step 4: Start the HTTP server
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`✅ Server listening on port ${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`🌐 API available at http://localhost:${PORT}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        // eslint-disable-next-line no-console
        console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change the PORT in .env`);
      } else {
        // eslint-disable-next-line no-console
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    // Handle startup errors
    // eslint-disable-next-line no-console
    console.error("❌ Failed to start server:", error.message);
    // eslint-disable-next-line no-console
    console.error("Full error:", error);
    process.exit(1);
  }
})();
