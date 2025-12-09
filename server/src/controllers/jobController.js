/**
 * Job Controller
 * 
 * Manages job postings, applications, assignments, and payments.
 * Handles the entire lifecycle of a job from creation to completion.
 */

const createError = require("http-errors");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { notifyUser } = require("../services/notificationService");

/**
 * Helper function to build MongoDB query filters based on request query parameters.
 * 
 * @param {Object} query - Express request query object
 * @returns {Object} MongoDB filter object
 */
const buildJobFilters = (query = {}) => {
  const filters = {};
  if (query.status) {
    filters.status = query.status;
  }
  if (query.requiredSkill) {
    filters.requiredSkill = query.requiredSkill;
  }
  if (query.minBudget) {
    filters.budget = { $gte: Number(query.minBudget) };
  }
  if (query.clientId) {
    filters.client = query.clientId;
  }
  return filters;
};

/**
 * Create a new job posting
 * 
 * @route POST /api/jobs
 * @access Private (Client only)
 */
exports.createJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    throw createError(403, "Only clients can create jobs");
  }

  const job = await Job.create({
    client: req.user.id,
    title: req.body.title,
    description: req.body.description,
    requiredSkill: req.body.requiredSkill,
    budget: req.body.budget,
    duration: req.body.duration,
    location: req.user.location || req.user.address || "Dhaka", // Fallback if no location
  });

  await User.findByIdAndUpdate(req.user.id, { $inc: { postedJobs: 1 } });

  res.status(201).json({ job });
});

/**
 * Get all jobs with filtering and pagination
 * 
 * Supports filtering by status, skill, budget, and search text.
 * Providers only see open jobs they haven't applied to (unless specified).
 * 
 * @route GET /api/jobs
 * @access Private
 */
exports.getJobs = asyncHandler(async (req, res) => {
  const filters = buildJobFilters(req.query);

  if (req.query.search) {
    filters.$text = { $search: req.query.search };
  }

  const shouldExcludeApplied =
    req.user.role === "provider" && req.query.includeApplied !== "true";

  if (req.user.role === "provider" && !filters.status) {
    filters.status = "open";
  }

  if (shouldExcludeApplied) {
    const appliedJobIds = await Application.find({
      provider: req.user.id,
    }).distinct("job");

    if (appliedJobIds.length) {
      filters._id = filters._id ?? {};
      filters._id.$nin = [
        ...(filters._id.$nin ?? []),
        ...appliedJobIds.map((id) => id.toString()),
      ];
    }
  }

  const query = Job.find(filters)
    .sort({ createdAt: -1 })
    .limit(200);

  const shouldPopulateClients =
    req.query.includeClients ||
    req.user.role === "admin" ||
    req.user.role === "provider";

  if (shouldPopulateClients) {
    query.populate({
      path: "client",
      select: "name email location role completedJobs postedJobs avatarUrl",
    });
  }

  query.populate({ path: "assignedProvider", select: "name email" });

  const jobs = await query;
  const validJobs = jobs.filter((job) => job.client);

  res.json({ jobs: validJobs });
});

/**
 * Get job details by ID
 * 
 * @route GET /api/jobs/:id
 * @access Private
 */
exports.getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate({ path: "client", select: "name email location" })
    .populate({ path: "assignedProvider", select: "name email" });

  if (!job) {
    throw createError(404, "Job not found");
  }

  res.json({ job });
});

/**
 * Update a job posting
 * 
 * @route PUT /api/jobs/:id
 * @access Private (Job owner or Admin)
 */
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw createError(404, "Job not found");
  }

  if (
    job.client.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    throw createError(403, "You are not allowed to update this job");
  }

  const updates = {
    title: req.body.title,
    description: req.body.description,
    requiredSkill: req.body.requiredSkill,
    budget: req.body.budget,
    duration: req.body.duration,
    location: req.body.location,
  };

  Object.keys(updates).forEach((key) => {
    if (typeof updates[key] === "undefined") {
      delete updates[key];
    }
  });

  Object.assign(job, updates);
  await job.save();

  res.json({ job });
});

/**
 * Delete a job posting
 * 
 * Removes the job and all associated applications.
 * 
 * @route DELETE /api/jobs/:id
 * @access Private (Job owner or Admin)
 */
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw createError(404, "Job not found");
  }

  if (
    job.client.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    throw createError(403, "You are not allowed to delete this job");
  }

  await Application.deleteMany({ job: job.id });
  await job.deleteOne();

  res.status(204).send();
});

/**
 * Get jobs posted by the current client
 * 
 * @route GET /api/jobs/client/posted
 * @access Private (Client only)
 */
exports.getClientJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== "client") {
    throw createError(403, "Only clients can access their jobs");
  }

  const filters = buildJobFilters({
    ...req.query,
    clientId: req.user.id,
  });

  const jobs = await Job.find(filters)
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ jobs });
});

/**
 * Update job status
 * 
 * Handles status transitions (e.g., to 'completed').
 * Updates stats for clients and providers upon completion.
 * Cleans up chat conversations for completed jobs.
 * 
 * @route PATCH /api/jobs/:id/status
 * @access Private (Job owner or Admin)
 */
exports.updateJobStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !["open", "in-progress", "completed", "cancelled"].includes(status)) {
    throw createError(400, "Invalid status value");
  }

  const job = await Job.findById(id);
  if (!job) {
    throw createError(404, "Job not found");
  }

  if (
    job.client.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    throw createError(403, "You cannot update this job");
  }

  job.status = status;
  await job.save();

  if (status === "completed" && job.assignedProvider) {
    await User.findByIdAndUpdate(job.assignedProvider, {
      $inc: { completedJobs: 1 },
    });

    await User.findByIdAndUpdate(job.client, {
      $inc: { completedJobs: 1 },
    });

    await Application.updateMany(
      { job: job.id, provider: job.assignedProvider },
      { status: "completed" }
    );

    // Delete conversations and messages related to this job
    const Conversation = require("../models/Conversation");
    const Message = require("../models/Message");

    const conversations = await Conversation.find({ job: job._id });
    const conversationIds = conversations.map((conv) => conv._id);

    // Delete all messages in these conversations
    if (conversationIds.length > 0) {
      await Message.deleteMany({ conversation: { $in: conversationIds } });
    }

    // Delete the conversations
    await Conversation.deleteMany({ job: job._id });

    // eslint-disable-next-line no-console
    console.log(`Deleted ${conversationIds.length} conversations and their messages for completed job ${job._id}`);
  }

  res.json({ job });
});

/**
 * Assign a provider to a job
 * 
 * Sets the job status to 'in-progress' and the application status to 'hired'.
 * Rejects other applications for the same job.
 * Notifies the selected provider.
 * 
 * @route POST /api/jobs/:id/assign
 * @access Private (Job owner or Admin)
 */
exports.assignJobProvider = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { providerId } = req.body;
  const io = req.app.get("socket");

  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    throw createError(400, "Invalid provider ID");
  }

  const job = await Job.findById(id).populate("client");
  if (!job) {
    throw createError(404, "Job not found");
  }

  if (
    job.client.id !== req.user.id &&
    req.user.role !== "admin"
  ) {
    throw createError(403, "You cannot assign this job");
  }

  const provider = await User.findById(providerId);
  if (!provider || provider.role !== "provider") {
    throw createError(404, "Provider not found");
  }

  const application = await Application.findOne({
    job: job.id,
    provider: providerId,
  });

  if (!application) {
    throw createError(400, "Provider has not applied to this job");
  }

  job.assignedProvider = providerId;
  job.status = "in-progress";
  job.hiredApplication = application.id;
  await job.save();

  application.status = "hired";
  await application.save();

  await Application.updateMany(
    { job: job.id, _id: { $ne: application.id } },
    { status: "rejected" }
  );

  await notifyUser({
    recipient: providerId,
    title: "You've been hired",
    body: `${job.title} has been assigned to you`,
    type: "accept",
    link: `/provider/jobs/${job.id}`,
    metadata: { jobId: job.id },
    io,
  });

  res.json({ job });
});

/**
 * Get recommended jobs for a provider
 * 
 * Based on provider's skills and excluding jobs they've already applied to.
 * 
 * @route GET /api/jobs/recommended
 * @access Private (Provider only)
 */
exports.getRecommendedJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== "provider") {
    return res.json({ jobs: [] });
  }

  const appliedJobIds = await Application.find({
    provider: req.user.id,
  }).distinct("job");

  const filters = {
    status: "open",
    client: { $ne: req.user.id },
    _id: { $nin: appliedJobIds },
  };

  if (req.user.skills?.length) {
    filters.requiredSkill = { $in: req.user.skills };
  }

  const jobs = await Job.find(filters)
    .sort({ createdAt: -1 })
    .limit(10)
    .populate({ path: "client", select: "name location completedJobs avatarUrl" });

  const validJobs = jobs.filter((job) => job.client);

  res.json({ jobs: validJobs });
});

/**
 * Process payment for a job
 * 
 * Simulates a payment transaction.
 * Updates payment status, amounts, and user financial stats.
 * Notifies the provider of received payment.
 * 
 * @route POST /api/jobs/:id/pay
 * @access Private (Job owner or Admin)
 */
exports.processPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  const io = req.app.get("socket");

  const job = await Job.findById(id);
  if (!job) {
    throw createError(404, "Job not found");
  }

  if (job.client.toString() !== req.user.id && req.user.role !== "admin") {
    throw createError(403, "Only the client can pay for this job");
  }

  if (job.status !== "completed") {
    throw createError(400, "Job must be completed before payment");
  }

  if (job.paymentStatus === "paid") {
    throw createError(400, "Job is already paid");
  }

  if (!job.assignedProvider) {
    throw createError(400, "No provider assigned to this job");
  }

  // Process mock payment
  job.paymentStatus = "paid";
  job.paymentDate = new Date();
  job.paymentAmount = amount || job.budget;
  await job.save();

  // Update provider earnings
  await User.findByIdAndUpdate(job.assignedProvider, {
    $inc: { totalEarnings: job.paymentAmount },
  });

  // Update client spending
  await User.findByIdAndUpdate(job.client, {
    $inc: { totalSpent: job.paymentAmount },
  });

  await notifyUser({
    recipient: job.assignedProvider,
    title: "Payment Received",
    body: `You received ৳${job.paymentAmount} for ${job.title}`,
    type: "payment",
    link: `/provider/earnings`,
    metadata: { jobId: job.id },
    io,
  });

  res.json({ job });
});
