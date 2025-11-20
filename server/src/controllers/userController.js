const createError = require("http-errors");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const editableFields = [
  "name",
  "location",
  "skills",
  "hourlyRate",
  "experienceYears",
  "phone",
  "bio",
  "avatarUrl",
];

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

exports.searchProviders = asyncHandler(async (req, res) => {
  const {
    search,
    skill,
    location,
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

  if (location) {
    filters.location = new RegExp(location, "i");
  }

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

  const providers = await User.find(filters).sort(sortOrder).limit(200);

  res.json({ providers: providers.map(formatProviderSummary) });
});
