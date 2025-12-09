const Notification = require("../models/Notification");

/**
 * Send a notification to a specific user.
 * 
 * Persists the notification to MongoDB and emits a real-time event via Socket.IO.
 * 
 * @param {Object} params - Notification parameters
 * @param {string|ObjectId} params.recipient - ID of the user to receive the notification
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body content
 * @param {string} [params.type='info'] - Type of notification (info, warning, success, etc.)
 * @param {string} [params.link] - Optional link to redirect user when clicked
 * @param {Object} [params.metadata] - Additional data to attach to the notification
 * @param {Object} [params.io] - Socket.IO instance for real-time emission
 * @returns {Promise<Object>} Created notification document
 */
async function notifyUser({ recipient, title, body, type = "info", link, metadata, io }) {
  const notification = await Notification.create({
    recipient,
    title,
    body,
    type,
    link,
    metadata,
  });

  if (io) {
    io.emitToUser(recipient, "notification:new", notification.toJSON());
  }

  return notification;
}

module.exports = {
  notifyUser,
};
