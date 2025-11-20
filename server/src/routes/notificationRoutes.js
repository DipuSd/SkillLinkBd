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

router.use(authenticate);

router.get("/notifications", listNotifications);
router.patch("/notifications/:id/read", markRead);
router.patch("/notifications/read-all", markAllRead);
router.delete("/notifications/:id", deleteNotification);
router.delete("/notifications", clearNotifications);

module.exports = router;
