const express = require("express");
const { body } = require("express-validator");
const {
  createDirectJob,
  listDirectJobs,
  updateDirectJobStatus,
  processDirectJobPayment,
} = require("../controllers/directJobController");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Global Middleware for Direct Job Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   POST /api/direct-jobs
 * @desc    Create a direct job invitation (client invites a specific provider).
 * @access  Private (Authenticated users)
 */
router.post(
  "/direct-jobs",
  [
    body("providerId").notEmpty().withMessage("Provider is required"),
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  validateRequest,
  createDirectJob
);

/**
 * @route   GET /api/direct-jobs
 * @desc    List all direct jobs (filtered by user role).
 * @access  Private (Authenticated users)
 */
router.get("/direct-jobs", listDirectJobs);

/**
 * @route   PATCH /api/direct-jobs/:id/status
 * @desc    Update the status of a direct job (accept/reject/complete).
 * @access  Private (Authenticated users)
 */
router.patch(
  "/direct-jobs/:id/status",
  [body("action").notEmpty().withMessage("Action is required")],
  validateRequest,
  updateDirectJobStatus
);

/**
 * @route   POST /api/direct-jobs/:id/pay
 * @desc    Process payment for a completed direct job.
 * @access  Private (Authenticated users)
 */
router.post(
  "/direct-jobs/:id/pay",
  [body("amount").optional().isNumeric()],
  validateRequest,
  processDirectJobPayment
);

module.exports = router;

