const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from the request and attaches the user object to req.user.
 * Token can be provided in:
 * - Authorization header (Bearer token)
 * - Cookie (token)
 * 
 * @throws {401} If token is missing, invalid, or expired
 * @throws {403} If user account is banned
 */
async function authenticate(req, _res, next) {
  try {
    let token = null;

    // Extract token from Authorization header or cookies
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Ensure token exists
    if (!token) {
      throw createError(401, "Authentication required");
    }

    // Verify and decode the JWT token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    // Check if user exists in database
    if (!user) {
      throw createError(401, "Account not found");
    }

    // Check if user account is banned
    if (user.status === "banned" || user.isBanned) {
      throw createError(403, "Your account has been banned");
    }

    // Attach user object to request for use in subsequent middleware/controllers
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT verification errors
    if (!error.status) {
      error.status = 401;
      error.message = "Invalid or expired token";
    }
    next(error);
  }
}

/**
 * Authorization Middleware Factory
 * 
 * Creates a middleware function that checks if the authenticated user has one of the allowed roles.
 * This middleware should be used after the authenticate middleware.
 * 
 * @param {...string} allowedRoles - List of roles that are allowed to access the route (e.g., 'admin', 'client', 'provider')
 * @returns {Function} Express middleware function
 * @throws {401} If user is not authenticated
 * @throws {403} If user's role is not in the allowed roles list
 * 
 * @example
 * router.get('/admin/users', authenticate, authorizeRoles('admin'), getUsers);
 */
function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    // Ensure user is authenticated (should be set by authenticate middleware)
    if (!req.user) {
      return next(createError(401, "Authentication required"));
    }

    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(req.user.role)) {
      return next(createError(403, "You do not have permission to perform this action"));
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeRoles,
};
