const express = require("express");
const { body } = require("express-validator");
const {
  createReview,
  getProviderReviews,
} = require("../controllers/reviewController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

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

router.get("/reviews/provider/:providerId", getProviderReviews);

module.exports = router;
