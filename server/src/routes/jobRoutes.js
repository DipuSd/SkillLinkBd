const express = require("express");
const { body } = require("express-validator");
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getClientJobs,
  updateJobStatus,
  assignJobProvider,
  getRecommendedJobs,
  processPayment,
} = require("../controllers/jobController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Global Middleware for Job Routes
 * 
 * All routes in this file require the user to be authenticated.
 * The `authenticate` middleware attaches the user object to `req.user`.
 */
router.use(authenticate);

/**
 * @route   GET /api/jobs
 * @desc    Get a list of all jobs (with optional filters).
 * @access  Private (Authenticated users)
 */
router.get("/jobs", getJobs);

/**
 * @route   GET /api/jobs/recommended
 * @desc    Get jobs recommended for the current user based on their skills.
 * @access  Private (Authenticated users)
 */
router.get("/jobs/recommended", getRecommendedJobs);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get details of a specific job by its ID.
 * @access  Private (Authenticated users)
 */
router.get("/jobs/:id", getJobById);

/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting.
 * @access  Private (Client, Admin)
 * 
 * Middleware:
 * - authorizeRoles: Ensures only 'client' or 'admin' can create jobs.
 * - Validation: Checks for title, description, requiredSkill, and numeric budget.
 */
router.post(
  "/jobs",
  authorizeRoles("client", "admin"),
  [
    body("title").notEmpty(),
    body("description").notEmpty(),
    body("requiredSkill").notEmpty(),
    body("budget").isNumeric(),
  ],
  validateRequest,
  createJob
);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update an existing job.
 * @access  Private (Client, Admin)
 */
router.put(
  "/jobs/:id",
  authorizeRoles("client", "admin"),
  updateJob
);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job.
 * @access  Private (Client, Admin)
 */
router.delete(
  "/jobs/:id",
  authorizeRoles("client", "admin"),
  deleteJob
);

/**
 * @route   GET /api/client/jobs
 * @desc    Get all jobs created by the specific logged-in client.
 * @access  Private (Client, Admin)
 */
router.get("/client/jobs", authorizeRoles("client", "admin"), getClientJobs);

/**
 * @route   PATCH /api/jobs/:id/status
 * @desc    Update the status of a job (e.g., 'open', 'in-progress', 'completed').
 * @access  Private (Client, Admin)
 */
router.patch(
  "/jobs/:id/status",
  authorizeRoles("client", "admin"),
  [body("status").notEmpty()],
  validateRequest,
  updateJobStatus
);

/**
 * @route   PATCH /api/jobs/:id/assign
 * @desc    Assign a provider to a job.
 * @access  Private (Client, Admin)
 */
router.patch(
  "/jobs/:id/assign",
  authorizeRoles("client", "admin"),
  [body("providerId").notEmpty()],
  validateRequest,
  assignJobProvider
);

/**
 * @route   POST /api/jobs/:id/pay
 * @desc    Process payment for a completed job.
 * @access  Private (Client, Admin)
 */
router.post(
  "/jobs/:id/pay",
  authorizeRoles("client", "admin"),
  [body("amount").optional().isNumeric()],
  validateRequest,
  processPayment
);

module.exports = router;
