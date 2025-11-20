const createError = require("http-errors");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const buildAuthResponse = (user) => ({
  token: generateToken({ id: user.id, role: user.role }),
  user,
});

exports.register = asyncHandler(async (req, res) => {
  // eslint-disable-next-line no-console
  console.log("Registration request received:", {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    hasPassword: !!req.body.password,
  });

  const {
    name,
    email,
    password,
    role = "client",
    location,
    skills = [],
    hourlyRate,
    experienceYears,
    phone,
    bio,
  } = req.body;

  // Check MongoDB connection
  const mongoose = require("mongoose");
  // eslint-disable-next-line no-console
  console.log("MongoDB connection state:", mongoose.connection.readyState);
  
  if (mongoose.connection.readyState !== 1) {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection state:", mongoose.connection.readyState);
    throw createError(503, "Database connection is not available. Please try again later.");
  }

  try {
    // eslint-disable-next-line no-console
    console.log("Checking for existing user with email:", email.toLowerCase());
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      // eslint-disable-next-line no-console
      console.log("User already exists with email:", email);
      throw createError(409, "An account with this email already exists");
    }

    // eslint-disable-next-line no-console
    console.log("Creating new user...");
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      location,
      skills,
      hourlyRate,
      experienceYears,
      phone,
      bio,
    });

    // eslint-disable-next-line no-console
    console.log("User created successfully:", user._id);
    res.status(201).json(buildAuthResponse(user.toJSON()));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Registration error:", {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.status,
      errors: error.errors,
    });
    
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      throw createError(422, `Validation failed: ${messages.join(", ")}`);
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      throw createError(409, "An account with this email already exists");
    }
    
    // Re-throw if it's already an http-error
    if (error.status) {
      throw error;
    }
    
    // Generic error
    throw createError(500, `Account creation failed: ${error.message}`);
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    throw createError(401, "Invalid credentials");
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    throw createError(401, "Invalid credentials");
  }

  if (user.status === "banned" || user.isBanned) {
    throw createError(403, "Your account has been banned");
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(200).json(buildAuthResponse(user.toJSON()));
});

exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toJSON() });
});
