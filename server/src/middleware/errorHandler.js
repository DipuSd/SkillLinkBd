/**
 * Global Error Handler Middleware
 * 
 * Catches all errors passed to next(error) and sends a standardized JSON response.
 * Logs error details to console (except in test environment).
 * 
 * @param {Error} err - The error object
 * @param {Object} _req - Express request object (unused)
 * @param {Object} res - Express response object
 * @param {Function} _next - Express next function (unused)
 */
// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  // Extract status code from error or default to 500
  const status = err.status || 500;
  // Extract error message or use generic message
  const message = err.message || "Something went wrong";

  // Log error details to console (skip in test environment)
  if (process.env.NODE_ENV !== "test") {
    // eslint-disable-next-line no-console
    console.error("Error Handler:", {
      status,
      message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });
  }

  // Send standardized error response
  res.status(status).json({
    message,
    status,
    // Include validation errors if present
    ...(err.errors ? { errors: err.errors } : {}),
  });
};
