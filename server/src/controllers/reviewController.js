/**
 * Review Controller
 * 
 * Handles creation and retrieval of job reviews.
 * Updates user ratings upon review creation.
 */

const createError = require("http-errors");
const Review = require("../models/Review");
const Job = require("../models/Job");
const DirectJob = require("../models/DirectJob");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Create a new review
 * 
 * Validates the review (job must be completed, user must be participant).
 * Updates the target user's aggregate rating.
 * 
 * @route POST /api/reviews
 * @access Private
 */
exports.createReview = asyncHandler(async (req, res) => {
  const { jobId, rating, comment } = req.body;

  let job = await Job.findById(jobId);
  let isDirectJob = false;

  if (!job) {
    job = await DirectJob.findById(jobId);
    isDirectJob = true;
  }

  if (!job) {
    throw createError(404, "Job not found");
  }

  const assignedProviderId = isDirectJob
    ? job.provider?.toString()
    : job.assignedProvider?._id?.toString() || job.assignedProvider?.toString();

  if (!assignedProviderId) {
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

  if (isProviderReviewer && assignedProviderId !== req.user.id) {
    throw createError(403, "You can only review jobs you were assigned to");
  }

  let review = await Review.findOne({ job: jobId, reviewerRole });
  const targetUserId =
    reviewerRole === "client" ? assignedProviderId : job.client;
  const targetUser = await User.findById(targetUserId);

  if (review) {
    // Update existing review
    const oldRating = review.rating;
    const currentTotalScore = (targetUser.rating || 0) * (targetUser.totalRatings || 0);
    const newTotalScore = currentTotalScore - oldRating + rating;
    // Count remains the same
    const newAverage = newTotalScore / (targetUser.totalRatings || 1);

    review.rating = rating;
    review.comment = comment;
    await review.save();

    targetUser.rating = Number(newAverage.toFixed(2));
    await targetUser.save({ validateBeforeSave: false });

    return res.json({ review });
  }

  // Create new review
  review = await Review.create({
    job: jobId,
    client: job.client,
    provider: assignedProviderId,
    reviewerRole,
    rating,
    comment,
  });

  const totalRatings = (targetUser.totalRatings || 0) + 1;
  const currentAggregate = (targetUser.rating || 0) * (targetUser.totalRatings || 0);
  const newAverage = (currentAggregate + rating) / totalRatings;

  targetUser.totalRatings = totalRatings;
  targetUser.rating = Number(newAverage.toFixed(2));
  await targetUser.save({ validateBeforeSave: false });

  res.status(201).json({ review });
});

/**
 * Get reviews for a provider
 * 
 * @route GET /api/reviews/provider/:providerId
 * @access Private
 */
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
