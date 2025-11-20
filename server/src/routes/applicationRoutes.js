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

router.use(authenticate);

router.post(
  "/applications",
  [body("jobId").notEmpty().withMessage("Job ID is required")],
  validateRequest,
  applyToJob
);

router.get("/applications", getApplications);

router.patch(
  "/applications/:applicationId",
  [body("status").notEmpty()],
  validateRequest,
  updateApplicationStatus
);

module.exports = router;
