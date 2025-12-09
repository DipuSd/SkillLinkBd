const express = require("express");
const {
  listNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  clearNotifications,
} = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * Global Middleware for Notification Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the authenticated user.
 * @access  Private
 */
router.get("/notifications", listNotifications);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read.
 * @access  Private
 */
router.patch("/notifications/:id/read", markRead);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read for the authenticated user.
 * @access  Private
 */
router.patch("/notifications/read-all", markAllRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification.
 * @access  Private
 */
router.delete("/notifications/:id", deleteNotification);

/**
 * @route   DELETE /api/notifications
 * @desc    Clear all notifications for the authenticated user.
 * @access  Private
 */
router.delete("/notifications", clearNotifications);

module.exports = router;
