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
} = require("../controllers/jobController");
const { authenticate, authorizeRoles } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.get("/jobs", getJobs);
router.get("/jobs/recommended", getRecommendedJobs);
router.get("/jobs/:id", getJobById);

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

router.put(
  "/jobs/:id",
  authorizeRoles("client", "admin"),
  updateJob
);

router.delete(
  "/jobs/:id",
  authorizeRoles("client", "admin"),
  deleteJob
);

router.get("/client/jobs", authorizeRoles("client", "admin"), getClientJobs);

router.patch(
  "/jobs/:id/status",
  authorizeRoles("client", "admin"),
  [body("status").notEmpty()],
  validateRequest,
  updateJobStatus
);

router.patch(
  "/jobs/:id/assign",
  authorizeRoles("client", "admin"),
  [body("providerId").notEmpty()],
  validateRequest,
  assignJobProvider
);

module.exports = router;
