const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authenticate(req, _res, next) {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw createError(401, "Authentication required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);

    if (!user) {
      throw createError(401, "Account not found");
    }

    if (user.status === "banned" || user.isBanned) {
      throw createError(403, "Your account has been banned");
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "Invalid or expired token";
    }
    next(error);
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(createError(401, "Authentication required"));
    }

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
