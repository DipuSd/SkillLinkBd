/**
 * Express Application Configuration
 * 
 * Sets up the Express app with middleware, routes, and error handling.
 * This file exports the configured Express app for use by the server.
 */

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import route modules
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const chatRoutes = require("./routes/chatRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const directJobRoutes = require("./routes/directJobRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Configure allowed origins for CORS
const allowedOrigins = (process.env.CLIENT_URL?.split(",") ?? [
  "http://localhost:5173",
]).map((origin) => origin.trim());

// Enable CORS with credentials support
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// HTTP request logger (only in development)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", jobRoutes);
app.use("/api", applicationRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", chatRoutes);
app.use("/api", notificationRoutes);
app.use("/api", reportRoutes);
app.use("/api", reviewRoutes);
app.use("/api", directJobRoutes);
app.use("/api", require("./routes/uploadRoutes"));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
