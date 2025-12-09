/**
 * Notification Controller
 * 
 * Manages user notifications.
 * Handles listing, marking as read, and deletion of notifications.
 */

const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Get user notifications
 * 
 * @route GET /api/notifications
 * @access Private
 */
exports.listNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;
  
  const filter = { recipient: req.user.id };
  if (unreadOnly === "true") {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ notifications });
});

/**
 * Mark a notification as read
 * 
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );

  res.json({ notification });
});

/**
 * Mark all notifications as read
 * 
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id }, { isRead: true });
  res.json({ success: true });
});

/**
 * Delete a notification
 * 
 * @route DELETE /api/notifications/:id
 * @access Private
 */
exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });
  res.status(204).send();
});

/**
 * Clear all notifications
 * 
 * @route DELETE /api/notifications
 * @access Private
 */
exports.clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user.id });
  res.status(204).send();
});
