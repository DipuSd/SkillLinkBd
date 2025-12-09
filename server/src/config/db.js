const mongoose = require("mongoose");

// Track connection state to prevent duplicate connections
let isConnected = false;

/**
 * Database Connection Function
 * 
 * Establishes connection to MongoDB using the MONGODB_URI environment variable.
 * Implements connection state tracking to prevent duplicate connections.
 * 
 * @throws {Error} If MONGODB_URI is not set or connection fails
 */
async function connectDB() {
  // Reset connection state if disconnected
  if (mongoose.connection.readyState === 0) {
    isConnected = false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const error = new Error("MONGODB_URI is not set in environment variables. Please check your .env file.");
    // eslint-disable-next-line no-console
    console.error("❌", error.message);
    throw error;
  }

  mongoose.set("strictQuery", true);

  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await mongoose.connect(uri, {
      autoIndex: true,
    });

    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    isConnected = false;
    // eslint-disable-next-line no-console
    console.error("❌ MongoDB connection error:", error.message);
    throw new Error(`Failed to connect to MongoDB: ${error.message}. Please check your MONGODB_URI in the .env file.`);
  }
}

module.exports = connectDB;
