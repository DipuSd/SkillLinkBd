const express = require("express");
const { body } = require("express-validator");
const {
  applyToJob,
  getApplications,
  updateApplicationStatus,
} = require("../controllers/applicationController");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Global Middleware for Application Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   POST /api/applications
 * @desc    Apply to a job posting.
 * @access  Private (Authenticated users)
 */
router.post(
  "/applications",
  [body("jobId").notEmpty().withMessage("Job ID is required")],
  validateRequest,
  applyToJob
);

/**
 * @route   GET /api/applications
 * @desc    Get all applications (filtered by user role - providers see their applications, clients see applications to their jobs).
 * @access  Private (Authenticated users)
 */
router.get("/applications", getApplications);

/**
 * @route   PATCH /api/applications/:applicationId
 * @desc    Update the status of an application (accept/reject).
 * @access  Private (Authenticated users)
 */
router.patch(
  "/applications/:applicationId",
  [body("status").notEmpty()],
  validateRequest,
  updateApplicationStatus
);

module.exports = router;
