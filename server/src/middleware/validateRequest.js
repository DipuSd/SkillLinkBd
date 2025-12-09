const { validationResult } = require("express-validator");
const createError = require("http-errors");

/**
 * Request Validation Middleware
 * 
 * Checks for validation errors from express-validator and returns a 422 error if any are found.
 * This middleware should be used after express-validator validation chains.
 * 
 * @param {Object} req - Express request object
 * @param {Object} _res - Express response object (unused)
 * @param {Function} next - Express next function
 * @throws {422} If validation errors are found
 * 
 * @example
 * router.post('/users',
 *   [body('email').isEmail(), body('name').notEmpty()],
 *   validateRequest,
 *   createUser
 * );
 */
module.exports = (req, _res, next) => {
  // Extract validation results from the request
  const result = validationResult(req);
  
  // Check if there are any validation errors
  if (!result.isEmpty()) {
    // eslint-disable-next-line no-console
    console.error("Validation errors:", result.array());
    
    // Get array of error objects
    const errors = result.array();
    
    // Format error messages for user-friendly response
    const errorMessages = errors.map((err) => `${err.param}: ${err.msg}`).join(", ");
    
    // Create a 422 Unprocessable Entity error
    const error = createError(422, `Validation failed: ${errorMessages}`);
    error.errors = errors;
    
    return next(error);
  }
  
  // No validation errors, proceed to next middleware
  return next();
};
