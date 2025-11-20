const jwt = require("jsonwebtoken");

const TOKEN_TTL = "12h";

module.exports = function generateToken(payload, options = {}) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: TOKEN_TTL,
    ...options,
  });
};
