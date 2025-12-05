const express = require("express");
const upload = require("../middleware/upload");
const { uploadFile } = require("../controllers/uploadController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/upload", authenticate, upload.single("file"), uploadFile);

module.exports = router;
