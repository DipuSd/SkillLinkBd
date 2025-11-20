const express = require("express");
const { body } = require("express-validator");
const {
  listConversations,
  startConversation,
  getMessages,
  sendMessage,
} = require("../controllers/chatController");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.get("/chat/conversations", listConversations);

router.post(
  "/chat/start",
  [body("participantId").notEmpty().withMessage("Participant ID is required")],
  validateRequest,
  startConversation
);

router.get("/chat/conversations/:conversationId", getMessages);

router.post(
  "/chat/conversations/:conversationId",
  [body("body").notEmpty().withMessage("Message body is required")],
  validateRequest,
  sendMessage
);

module.exports = router;
