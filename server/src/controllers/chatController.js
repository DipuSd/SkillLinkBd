/**
 * Chat Controller
 * 
 * Manages messaging and conversations between users.
 * Supports real-time updates via Socket.IO.
 */

const createError = require("http-errors");
const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const asyncHandler = require("../utils/asyncHandler");

/**
 * List conversations for the current user
 * 
 * @route GET /api/chat/conversations
 * @access Private
 */
exports.listConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user.id,
  })
    .sort({ updatedAt: -1 })
    .populate({ path: "participants", select: "name avatarUrl role" })
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name" },
    });

  res.json({ conversations });
});

/**
 * Get messages for a specific conversation
 * 
 * Marks messages as read by the current user.
 * 
 * @route GET /api/chat/conversations/:conversationId/messages
 * @access Private
 */
exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  if (!conversation.participants.some((id) => id.toString() === req.user.id)) {
    throw createError(403, "You are not part of this conversation");
  }

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: 1 })
    .populate({ path: "sender", select: "name avatarUrl" });

  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } }
  );

  conversation.unreadCount.set(req.user.id, 0);
  await conversation.save({ validateBeforeSave: false });

  res.json({ messages });
});

/**
 * Send a message
 * 
 * Emits real-time socket event 'chat:message'.
 * Updates conversation lastMessage and unread counts.
 * 
 * @route POST /api/chat/conversations/:conversationId/messages
 * @access Private
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { body } = req.body;
  const io = req.app.get("socket");

  if (!body) {
    throw createError(400, "Message body is required");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  if (!conversation.participants.some((id) => id.toString() === req.user.id)) {
    throw createError(403, "You are not part of this conversation");
  }

  const message = await Message.create({
    conversation: conversationId,
    sender: req.user.id,
    body,
    readBy: [req.user.id],
  });

  conversation.lastMessage = message.id;
  conversation.updatedAt = new Date();
  conversation.participants.forEach((participantId) => {
    const idString = participantId.toString();
    if (idString !== req.user.id) {
      const current = conversation.unreadCount.get(idString) || 0;
      conversation.unreadCount.set(idString, current + 1);
    } else {
      conversation.unreadCount.set(idString, 0);
    }
  });
  await conversation.save({ validateBeforeSave: false });

  const payload = await Message.findById(message.id)
    .populate({ path: "sender", select: "name avatarUrl" })
    .lean();

  if (io) {
    io.emitToConversation(conversationId, "chat:message", payload);
  }

  res.status(201).json({ message: payload });
});

/**
 * Start or get existing conversation
 * 
 * If a conversation exists between participants and (optionally) for a specific job, returns it.
 * Otherwise creates a new one.
 * 
 * @route POST /api/chat/conversations
 * @access Private
 */
exports.startConversation = asyncHandler(async (req, res) => {
  const { participantId, jobId } = req.body;

  if (!participantId) {
    throw createError(400, "Participant ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(participantId)) {
    throw createError(400, "Invalid participant ID");
  }

  const participantObjectIds = [
    new mongoose.Types.ObjectId(req.user.id),
    new mongoose.Types.ObjectId(participantId),
  ];

  let conversation = await Conversation.findOne({
    $and: [
      { participants: { $all: participantObjectIds } },
      { participants: { $size: 2 } },
    ],
  });

  if (!conversation) {
    const unreadCount = {};
    participantObjectIds.forEach((id) => {
      unreadCount[id.toString()] = 0;
    });

    conversation = await Conversation.create({
      participants: participantObjectIds,
      job: jobId,
      unreadCount,
    });
  } else if (jobId && !conversation.job) {
    conversation.job = jobId;
    await conversation.save({ validateBeforeSave: false });
  }

  conversation = await Conversation.findById(conversation.id)
    .populate({ path: "participants", select: "name avatarUrl role" })
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name" },
    });

  res.status(201).json({ conversation });
});

/**
 * Delete a conversation
 * 
 * Removes the conversation and all its messages.
 * 
 * @route DELETE /api/chat/conversations/:conversationId
 * @access Private
 */
exports.deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw createError(404, "Conversation not found");
  }

  if (!conversation.participants.some((id) => id.toString() === req.user.id)) {
    throw createError(403, "You are not part of this conversation");
  }

  await Message.deleteMany({ conversation: conversationId });
  await Conversation.findByIdAndDelete(conversationId);

  res.json({ message: "Conversation deleted successfully" });
});
