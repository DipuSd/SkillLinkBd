const express = require("express");
const { body } = require("express-validator");
const {
  createReport,
  getReports,
  updateReport,
} = require("../controllers/reportController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Global Middleware for Report Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   POST /api/reports
 * @desc    Create a report against another user.
 * @access  Private (Authenticated users)
 */
router.post(
  "/reports",
  [
    body("reportedUserId").notEmpty(),
    body("reason").notEmpty(),
    body("description").notEmpty(),
  ],
  validateRequest,
  createReport
);

/**
 * @route   GET /api/reports
 * @desc    Get all reports (admin sees all, users see their own reports).
 * @access  Private (Authenticated users)
 */
router.get("/reports", getReports);

/**
 * @route   PATCH /api/reports/:id
 * @desc    Update the status of a report (resolve, dismiss, etc.).
 * @access  Private (Admin only)
 */
router.patch(
  "/reports/:id",
  authorizeRoles("admin"),
  [body("status").notEmpty()],
  validateRequest,
  updateReport
);

module.exports = router;
