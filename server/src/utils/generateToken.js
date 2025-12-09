const jwt = require("jsonwebtoken");

// Default token expiration time
const TOKEN_TTL = "12h";

/**
 * Generate JWT Token
 * 
 * Creates a signed JWT token with the provided payload.
 * 
 * @param {Object} payload - Data to encode in the token (typically user ID and role)
 * @param {Object} options - Additional JWT sign options
 * @returns {string} Signed JWT token
 * @throws {Error} If JWT_SECRET is not configured
 */
module.exports = function generateToken(payload, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
    ...options,
  });
};
