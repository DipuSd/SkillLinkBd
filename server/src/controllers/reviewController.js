const createError = require("http-errors");
const Review = require("../models/Review");
const Job = require("../models/Job");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.createReview = asyncHandler(async (req, res) => {
  const { jobId, rating, comment } = req.body;

  const job = await Job.findById(jobId);
  if (!job) {
    throw createError(404, "Job not found");
  }

  if (!job.assignedProvider) {
    throw createError(400, "No provider is assigned to this job");
  }

  const isClientReviewer = req.user.role === "client";
  const isProviderReviewer = req.user.role === "provider";

  if (!isClientReviewer && !isProviderReviewer) {
    throw createError(403, "You are not allowed to review this job");
  }

  if (job.status !== "completed") {
    throw createError(400, "You can only review completed jobs");
  }

  const reviewerRole = isClientReviewer ? "client" : "provider";

  if (isClientReviewer && job.client.toString() !== req.user.id) {
    throw createError(403, "You cannot review this job");
  }

  if (isProviderReviewer && job.assignedProvider.toString() !== req.user.id) {
    throw createError(403, "You cannot review this job");
  }

  const existing = await Review.findOne({ job: jobId, reviewerRole });
  if (existing) {
    throw createError(400, "You have already reviewed this job");
  }

  const review = await Review.create({
    job: jobId,
    client: job.client,
    provider: job.assignedProvider,
    reviewerRole,
    rating,
    comment,
  });

  const targetUserId =
    reviewerRole === "client" ? job.assignedProvider : job.client;
  const targetUser = await User.findById(targetUserId);

  const totalRatings = (targetUser.totalRatings || 0) + 1;
  const currentAggregate = (targetUser.rating || 0) * (targetUser.totalRatings || 0);
  const newAverage = (currentAggregate + rating) / totalRatings;

  targetUser.totalRatings = totalRatings;
  targetUser.rating = Number(newAverage.toFixed(2));
  await targetUser.save({ validateBeforeSave: false });

  res.status(201).json({ review });
});

exports.getProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({
    provider: req.params.providerId,
    reviewerRole: "client",
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate({ path: "client", select: "name" })
    .populate({ path: "job", select: "title" });

  res.json({ reviews });
});
