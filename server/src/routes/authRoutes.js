const express = require("express");
const { body } = require("express-validator");
const { register, login, getProfile } = require("../controllers/authController");
const validateRequest = require("../middleware/validateRequest");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account.
 * @access  Public
 * 
 * Validation:
 * - name: Required, minimum 2 characters
 * - email: Required, valid email format
 * - password: Required, minimum 6 characters
 * - role: Optional, must be 'client', 'provider', or 'admin'
 * - location: Optional
 */
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Valid email is required")
      .normalizeEmail(),
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .isIn(["client", "provider", "admin"])
      .withMessage("Role must be client, provider, or admin"),
    body("location").optional().trim(),
  ],
  validateRequest,
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token.
 * @access  Public
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get the authenticated user's profile.
 * @access  Private
 */
router.get("/profile", authenticate, getProfile);

module.exports = router;
