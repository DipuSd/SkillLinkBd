const mongoose = require("mongoose");

/**
 * Conversation Model Schema
 * 
 * Represents a chat conversation between two users.
 * Tracks participants, related job, and unread message counts.
 */
const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret._id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Database indexes for optimized queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 }); // Sort by most recent

module.exports = mongoose.model("Conversation", conversationSchema);
