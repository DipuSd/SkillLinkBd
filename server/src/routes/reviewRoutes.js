const express = require("express");
const { body } = require("express-validator");
const {
  createReview,
  getProviderReviews,
} = require("../controllers/reviewController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * Global Middleware for Review Routes
 * 
 * All routes require authentication.
 */
router.use(authenticate);

/**
 * @route   POST /api/reviews
 * @desc    Create a review for a provider after job completion.
 * @access  Private (Client, Admin)
 */
router.post(
  "/reviews",
  authorizeRoles("client", "admin"),
  [
    body("jobId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isLength({ max: 500 }),
  ],
  validateRequest,
  createReview
);

/**
 * @route   GET /api/reviews/provider/:providerId
 * @desc    Get all reviews for a specific provider.
 * @access  Private (Authenticated users)
 */
router.get("/reviews/provider/:providerId", getProviderReviews);

module.exports = router;
