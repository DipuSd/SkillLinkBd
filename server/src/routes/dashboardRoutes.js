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

/**
 * Global Middleware for Dashboard Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   GET /api/client/dashboard
 * @desc    Get dashboard metrics for clients (active jobs, total spent, etc.).
 * @access  Private (Client, Admin)
 */
router.get(
  "/client/dashboard",
  authorizeRoles("client", "admin"),
  getClientDashboard
);

/**
 * @route   GET /api/client/history
 * @desc    Get job history for clients.
 * @access  Private (Client, Admin)
 */
router.get(
  "/client/history",
  authorizeRoles("client", "admin"),
  getClientHistory
);

/**
 * @route   GET /api/provider/dashboard
 * @desc    Get dashboard metrics for providers (active jobs, earnings, etc.).
 * @access  Private (Provider, Admin)
 */
router.get(
  "/provider/dashboard",
  authorizeRoles("provider", "admin"),
  getProviderDashboard
);

/**
 * @route   GET /api/provider/earnings
 * @desc    Get detailed earnings information for providers.
 * @access  Private (Provider, Admin)
 */
router.get(
  "/provider/earnings",
  authorizeRoles("provider", "admin"),
  getProviderEarnings
);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard with platform-wide statistics.
 * @access  Private (Admin only)
 */
router.get(
  "/admin/dashboard",
  authorizeRoles("admin"),
  getAdminDashboard
);

module.exports = router;
