const express = require("express");
const { body } = require("express-validator");
const { updateMe, listUsers, updateUserStatus, getUserById, searchProviders } = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

/**
 * @route   PUT /api/users/me
 * @desc    Update the currently logged-in user's profile.
 * @access  Private
 * 
 * Middleware:
 * - authenticate: Ensures the user is logged in.
 * - Validation: Checks for valid hourlyRate, experienceYears, and skills array.
 */
router.put(
  "/users/me",
  authenticate,
  [
    body("hourlyRate").optional().isNumeric().withMessage("Hourly rate must be a number"),
    body("experienceYears").optional().isNumeric(),
    body("skills").optional().isArray(),
  ],
  validateRequest,
  updateMe
);

/**
 * @route   GET /api/users/:id
 * @desc    Get public profile information of a specific user by ID.
 * @access  Private
 */
router.get(
  "/users/:id",
  authenticate,
  getUserById
);

/**
 * @route   GET /api/providers
 * @desc    Search/List providers (for clients to find workers).
 * @access  Private (Client, Admin)
 */
router.get(
  "/providers",
  authenticate,
  authorizeRoles("client", "admin"),
  searchProviders
);

/**
 * @route   GET /api/admin/users
 * @desc    Get a list of all users (for admin management).
 * @access  Private (Admin only)
 */
router.get(
  "/admin/users",
  authenticate,
  authorizeRoles("admin"),
  listUsers
);

/**
 * @route   PATCH /api/admin/users/:id
 * @desc    Update a user's status (e.g., suspend or ban a user).
 * @access  Private (Admin only)
 */
router.patch(
  "/admin/users/:id",
  authenticate,
  authorizeRoles("admin"),
  [body("status").isIn(["active", "suspended", "banned"]).withMessage("Invalid status")],
  validateRequest,
  updateUserStatus
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Permanently delete a user.
 * @access  Private (Admin only)
 */
router.delete(
  "/admin/users/:id",
  authenticate,
  authorizeRoles("admin"),
  require("../controllers/userController").deleteUser
);

module.exports = router;
