/**
 * Upload Controller
 * 
 * Handles file uploads and returns the file URL.
 */

const asyncHandler = require("../utils/asyncHandler");

/**
 * Upload a single file
 * 
 * Expectations: 'upload' middleware must run before this to handle the file processing.
 * Returns the public URL of the uploaded file.
 * 
 * @route POST /api/upload
 * @access Private
 */
exports.uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const protocol = req.protocol;
  const host = req.get("host");
  const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

  res.json({ url: fileUrl });
});
