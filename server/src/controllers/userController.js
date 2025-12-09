/**
 * User Controller
 * 
 * Handles user profile management, user listing, and provider search.
 * Includes admin functions for user management.
 */

const createError = require("http-errors");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const editableFields = [
  "name",
  "location",
  "coordinates",
  "skills",
  "hourlyRate",
  "experienceYears",
  "phone",
  "bio",
  "avatarUrl",
];

/**
 * Formats provider data for public/list display.
 * Strips sensitive or unnecessary fields.
 */
const formatProviderSummary = (provider) => ({
  _id: provider.id,
  name: provider.name,
  primarySkill: provider.skills?.[0] ?? "",
  skills: provider.skills,
  rating: provider.rating,
  completedJobs: provider.completedJobs,
  experience: provider.experienceYears,
  hourlyRate: provider.hourlyRate,
  status: provider.status,
  location: provider.location,
  avatarUrl: provider.avatarUrl,
});

/**
 * Update current user's profile
 * 
 * Updates allowed fields for the authenticated user.
 * 
 * @route PUT /api/users/me
 * @access Private
 */
exports.updateMe = asyncHandler(async (req, res) => {
  const updates = {};

  editableFields.forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      updates[field] = req.body[field];
    }
  });

  if (updates.skills && !Array.isArray(updates.skills)) {
    updates.skills = [updates.skills].flat().filter(Boolean);
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ user: user.toJSON() });
});

/**
 * List all users (Admin only)
 * 
 * @route GET /api/users
 * @access Private (Admin)
 */
exports.listUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;

  const filters = {};
  if (role) {
    filters.role = role;
  }

  if (search) {
    filters.$or = [
      { name: new RegExp(search, "i") },
      { email: new RegExp(search, "i") },
    ];
  }

  const users = await User.find(filters)
    .sort({ createdAt: -1 })
    .limit(200);

  res.json({ users });
});

/**
 * Get user profile by ID
 * 
 * Enforces role-based visibility rules (e.g., Clients see Providers).
 * 
 * @route GET /api/users/:id
 * @access Private
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");

  if (!user) {
    throw createError(404, "User not found");
  }

  // Only allow viewing provider profiles for clients/admins
  // Clients can view providers, providers can view clients, admins can view anyone
  if (req.user.role === "client" && user.role !== "provider") {
    throw createError(403, "You can only view provider profiles");
  }

  if (req.user.role === "provider" && user.role !== "client") {
    throw createError(403, "You can only view client profiles");
  }

  res.json({ user: user.toJSON() });
});

/**
 * Update user status (Ban/Suspend/Activate)
 * 
 * @route PATCH /api/users/:id/status
 * @access Private (Admin only)
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["active", "suspended", "banned"].includes(status)) {
    throw createError(400, "Invalid status value");
  }

  const user = await User.findById(id);
  if (!user) {
    throw createError(404, "User not found");
  }

  user.status = status;
  user.isBanned = status === "banned";
  await user.save({ validateBeforeSave: false });

  res.json({ user: user.toJSON() });
});

// Calculate distance between two coordinates using Haversine formula (in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Search and filter providers
 * 
 * Supports search by name/skill, filtering by rating, rate, experience.
 * Sorts by rating, newness, etc.
 * Filters by location distance if user coordinates available (within 20km).
 * 
 * @route GET /api/users/providers/search
 * @access Private
 */
exports.searchProviders = asyncHandler(async (req, res) => {
  const {
    search,
    skill,
    // location, // Removed location text search
    minRating,
    maxHourlyRate,
    minExperience,
    sort = "rating",
  } = req.query;

  const filters = {
    role: "provider",
    status: "active",
  };

  if (search) {
    const regex = new RegExp(search, "i");
    filters.$or = [{ name: regex }, { skills: regex }, { location: regex }];
  }

  if (skill) {
    const skills = Array.isArray(skill)
      ? skill
      : skill.split(",").map((item) => item.trim());
    filters.skills = { $in: skills.filter(Boolean) };
  }

  // Location filtering handled via coordinates now
  // if (location) {
  //   filters.location = new RegExp(location, "i");
  // }

  if (minRating) {
    filters.rating = { ...(filters.rating || {}), $gte: Number(minRating) };
  }

  if (maxHourlyRate) {
    filters.hourlyRate = {
      ...(filters.hourlyRate || {}),
      $lte: Number(maxHourlyRate),
    };
  }

  if (minExperience) {
    filters.experienceYears = {
      ...(filters.experienceYears || {}),
      $gte: Number(minExperience),
    };
  }

  let sortOrder = { rating: -1, completedJobs: -1 };

  if (sort === "newest") {
    sortOrder = { createdAt: -1 };
  } else if (sort === "budget") {
    sortOrder = { hourlyRate: 1 };
  } else if (sort === "experience") {
    sortOrder = { experienceYears: -1, rating: -1 };
  }

  let providers = await User.find(filters).sort(sortOrder).limit(200);

  // Filter by 20km radius if requester has coordinates
  if (req.user && req.user.coordinates?.latitude && req.user.coordinates?.longitude) {
    const clientLat = req.user.coordinates.latitude;
    const clientLon = req.user.coordinates.longitude;

    providers = providers.filter(provider => {
      if (!provider.coordinates?.latitude || !provider.coordinates?.longitude) {
        return false; 
      }
      const distance = calculateDistance(
        clientLat,
        clientLon,
        provider.coordinates.latitude,
        provider.coordinates.longitude
      );
      return distance <= 20;
    });
  }

  res.json({ providers: providers.map(formatProviderSummary) });
});

/**
 * Delete a user account
 * 
 * @route DELETE /api/users/:id
 * @access Private (Admin only)
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw createError(404, "User not found");
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
