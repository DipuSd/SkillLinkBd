const express = require("express");
const {
  getClientDashboard,
  getProviderDashboard,
  getAdminDashboard,
  getProviderEarnings,
  getClientHistory,
} = require("../controllers/dashboardController");
const { authenticate, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get(
  "/client/dashboard",
  authorizeRoles("client", "admin"),
  getClientDashboard
);
router.get(
  "/client/history",
  authorizeRoles("client", "admin"),
  getClientHistory
);

router.get(
  "/provider/dashboard",
  authorizeRoles("provider", "admin"),
  getProviderDashboard
);
router.get(
  "/provider/earnings",
  authorizeRoles("provider", "admin"),
  getProviderEarnings
);

router.get(
  "/admin/dashboard",
  authorizeRoles("admin"),
  getAdminDashboard
);

module.exports = router;
