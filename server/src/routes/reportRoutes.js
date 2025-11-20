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

router.use(authenticate);

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

router.get("/reports", getReports);

router.patch(
  "/reports/:id",
  authorizeRoles("admin"),
  [body("status").notEmpty()],
  validateRequest,
  updateReport
);

module.exports = router;
