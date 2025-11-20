const express = require("express");
const { body } = require("express-validator");
const { updateMe, listUsers, updateUserStatus, getUserById, searchProviders } = require("../controllers/userController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

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

router.get(
  "/users/:id",
  authenticate,
  getUserById
);

router.get(
  "/providers",
  authenticate,
  authorizeRoles("client", "admin"),
  searchProviders
);

router.get(
  "/admin/users",
  authenticate,
  authorizeRoles("admin"),
  listUsers
);

router.patch(
  "/admin/users/:id",
  authenticate,
  authorizeRoles("admin"),
  [body("status").isIn(["active", "suspended", "banned"]).withMessage("Invalid status")],
  validateRequest,
  updateUserStatus
);

module.exports = router;
