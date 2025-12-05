const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

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

exports.markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );

  res.json({ notification });
});

exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id }, { isRead: true });
  res.json({ success: true });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });
  res.status(204).send();
});

exports.clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user.id });
  res.status(204).send();
});
