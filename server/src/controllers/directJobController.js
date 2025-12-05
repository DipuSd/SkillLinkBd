const createError = require("http-errors");
const DirectJob = require("../models/DirectJob");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { notifyUser } = require("../services/notificationService");

exports.createDirectJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    throw createError(403, "Only clients can send direct job invitations");
  }

  const { providerId, title, description, budget, location, preferredDate, notes } = req.body;

  if (!providerId || !title || !description) {
    throw createError(400, "Provider, title, and description are required");
  }

  const provider = await User.findById(providerId);

  if (!provider || provider.role !== "provider") {
    throw createError(404, "Provider not found");
  }

  if (provider.status !== "active") {
    throw createError(400, "Provider is not available for invites");
  }

  const directJob = await DirectJob.create({
    client: req.user.id,
    provider: providerId,
    title,
    description,
    budget,
    location,
    preferredDate,
    notes,
  });

  await notifyUser({
    recipient: providerId,
    title: "New job invitation",
    body: `${req.user.name} invited you to "${title}"`,
    type: "info",
    metadata: { directJobId: directJob.id },
    io: req.app.get("socket"),
  });

  res.status(201).json({ directJob });
});

exports.listDirectJobs = asyncHandler(async (req, res) => {
  const scope = req.query.scope || (req.user.role === "provider" ? "provider" : "client");
  const { status } = req.query;

  const filters = {};

  if (scope === "provider") {
    if (req.user.role !== "provider") {
      throw createError(403, "Only providers can view provider invitations");
    }
    filters.provider = req.user.id;
  } else {
    if (req.user.role !== "client") {
      throw createError(403, "Only clients can view their invitations");
    }
    filters.client = req.user.id;
  }

  if (status) {
    filters.status = status;
  }

  const directJobs = await DirectJob.find(filters)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate({ path: "client", select: "name email location" })
    .populate({ path: "provider", select: "name skills rating location avatarUrl hourlyRate" });

  res.json({ directJobs });
});

exports.updateDirectJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const io = req.app.get("socket");

  if (!action) {
    throw createError(400, "Action is required");
  }

  const directJob = await DirectJob.findById(id);

  if (!directJob) {
    throw createError(404, "Direct job not found");
  }

  const isProvider = req.user.role === "provider";
  const isClient = req.user.role === "client";

  if (isProvider && directJob.provider.toString() !== req.user.id) {
    throw createError(403, "You cannot update this invitation");
  }

  if (isClient && directJob.client.toString() !== req.user.id) {
    throw createError(403, "You cannot update this invitation");
  }

  if (isProvider) {
    if (action === "accept") {
      if (directJob.status !== "requested") {
        throw createError(400, "Only pending invitations can be accepted");
      }
      directJob.status = "in-progress";
    } else if (action === "decline") {
      if (directJob.status !== "requested") {
        throw createError(400, "Only pending invitations can be declined");
      }
      directJob.status = "declined";
    } else if (action === "complete") {
      if (directJob.status !== "in-progress") {
        throw createError(400, "Only in-progress invitations can be completed");
      }
      directJob.status = "completed";
      directJob.completedAt = new Date();
    } else {
      throw createError(400, "Unsupported action");
    }
  } else if (isClient) {
    if (action !== "cancel") {
      throw createError(400, "Unsupported action");
    }
    if (!["requested", "in-progress"].includes(directJob.status)) {
      throw createError(400, "This invitation can no longer be cancelled");
    }
    directJob.status = "cancelled";
  } else {
    throw createError(403, "You cannot update this invitation");
  }

  await directJob.save();

  const recipient = isProvider ? directJob.client : directJob.provider;

  await notifyUser({
    recipient,
    title: "Direct job update",
    body: `Status for "${directJob.title}" is now ${directJob.status}`,
    type: "info",
    metadata: { directJobId: directJob.id },
    io,
  });

  res.json({ directJob });
});

exports.processDirectJobPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const io = req.app.get("socket");

  const directJob = await DirectJob.findById(id);

  if (!directJob) {
    throw createError(404, "Direct job not found");
  }

  // Only client or admin can pay
  if (req.user.role !== "admin" && directJob.client.toString() !== req.user.id) {
    throw createError(403, "Only the client can pay for this job");
  }

  // Job must be completed
  if (directJob.status !== "completed") {
    throw createError(400, "Only completed jobs can be paid");
  }

  // Check if already paid
  if (directJob.paymentStatus === "paid") {
    throw createError(400, "This job has already been paid");
  }

  // Process mock payment
  directJob.paymentStatus = "paid";
  directJob.paymentDate = new Date();
  directJob.paymentAmount = amount || directJob.budget;
  await directJob.save();

  // Update provider earnings
  await User.findByIdAndUpdate(directJob.provider, {
    $inc: { totalEarnings: directJob.paymentAmount },
  });

  // Update client spending
  await User.findByIdAndUpdate(directJob.client, {
    $inc: { totalSpent: directJob.paymentAmount },
  });

  // Notify provider
  await notifyUser({
    recipient: directJob.provider,
    title: "Payment received",
    body: `You received ৳${directJob.paymentAmount} for "${directJob.title}"`,
    type: "payment",
    metadata: { directJobId: directJob.id, amount: directJob.paymentAmount },
    io,
  });

  res.json({ directJob });
});

