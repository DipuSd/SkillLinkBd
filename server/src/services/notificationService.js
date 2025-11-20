const Notification = require("../models/Notification");

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
