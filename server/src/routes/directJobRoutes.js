const express = require("express");
const { body } = require("express-validator");
const {
  createDirectJob,
  listDirectJobs,
  updateDirectJobStatus,
} = require("../controllers/directJobController");
const { authenticate } = require("../middleware/auth");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

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

router.get("/direct-jobs", listDirectJobs);

router.patch(
  "/direct-jobs/:id/status",
  [body("action").notEmpty().withMessage("Action is required")],
  validateRequest,
  updateDirectJobStatus
);

module.exports = router;

