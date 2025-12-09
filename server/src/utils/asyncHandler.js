/**
 * Async Handler Wrapper
 * 
 * Wraps async route handlers to automatically catch and forward errors to Express error handler.
 * Eliminates the need for try-catch blocks in every async route handler.
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 * 
 * @example
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
