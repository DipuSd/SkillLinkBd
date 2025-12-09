const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Define the directory where uploaded files will be stored.
// path.join resolves the absolute path relative to this file's directory.
const uploadDir = path.join(__dirname, "../../uploads");

// Ensure the upload directory exists. If not, create it recursively.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Multer Disk Storage Configuration
 * 
 * Controls where file uploads are stored and how they are named.
 */
const storage = multer.diskStorage({
  // Destination function: specifies the folder
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // Filename function: generates a unique name to prevent collisions
  filename: function (req, file, cb) {
    // Uses current timestamp + random number + original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

/**
 * File Filter Function
 * 
 * Validates the file type before uploading. Only images are allowed.
 * 
 * @param {Object} req - The request object
 * @param {Object} file - The file object being uploaded
 * @param {Function} cb - Callback function (error, acceptFile)
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

/**
 * Multer Upload Middleware
 * 
 * Exports the configured multer instance.
 * - storage: disk storage settings
 * - fileFilter: validates file types
 * - limits: restricts file size to 5MB
 */
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
