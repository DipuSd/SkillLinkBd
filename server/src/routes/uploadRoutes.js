const express = require("express");
const upload = require("../middleware/upload");
const { uploadFile } = require("../controllers/uploadController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/upload
 * @desc    Upload a file (e.g., profile picture, job attachment).
 * @access  Private (Authenticated users)
 * 
 * Middleware:
 * - authenticate: Ensures user is logged in
 * - upload.single("file"): Multer middleware to handle single file upload
 */
router.post("/upload", authenticate, upload.single("file"), uploadFile);

module.exports = router;
