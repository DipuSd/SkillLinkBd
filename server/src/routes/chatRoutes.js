const express = require("express");
const { body } = require("express-validator");
const {
  listConversations,
  startConversation,
  getMessages,
  sendMessage,
  deleteConversation,
} = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Global Middleware for Chat Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   GET /api/chat/conversations
 * @desc    List all conversations for the authenticated user.
 * @access  Private
 */
router.get("/chat/conversations", listConversations);

/**
 * @route   POST /api/chat/start
 * @desc    Start a new conversation with another user.
 * @access  Private
 */
router.post(
  "/chat/start",
  [body("participantId").notEmpty().withMessage("Participant ID is required")],
  validateRequest,
  startConversation
);

/**
 * @route   GET /api/chat/conversations/:conversationId
 * @desc    Get all messages in a specific conversation.
 * @access  Private
 */
router.get("/chat/conversations/:conversationId", getMessages);

/**
 * @route   POST /api/chat/conversations/:conversationId
 * @desc    Send a message in a conversation.
 * @access  Private
 */
router.post(
  "/chat/conversations/:conversationId",
  [body("body").notEmpty().withMessage("Message body is required")],
  validateRequest,
  sendMessage
);

/**
 * @route   DELETE /api/chat/conversations/:conversationId
 * @desc    Delete a conversation.
 * @access  Private
 */
router.delete("/chat/conversations/:conversationId", deleteConversation);

module.exports = router;
