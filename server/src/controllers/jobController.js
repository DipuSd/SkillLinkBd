const createError = require("http-errors");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { notifyUser } = require("../services/notificationService");

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
    location: req.body.location,
  });

  await User.findByIdAndUpdate(req.user.id, { $inc: { postedJobs: 1 } });

  res.status(201).json({ job });
});

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
      status: { $ne: "rejected" },
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
      select: "name email location role rating completedJobs postedJobs avatarUrl",
    });
  }

  query.populate({ path: "assignedProvider", select: "name email" });

  const jobs = await query;

  res.json({ jobs });
});

exports.getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate({ path: "client", select: "name email location" })
    .populate({ path: "assignedProvider", select: "name email" });

  if (!job) {
    throw createError(404, "Job not found");
  }

  res.json({ job });
});

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

exports.getRecommendedJobs = asyncHandler(async (req, res) => {
  if (req.user.role !== "provider") {
    return res.json({ jobs: [] });
  }

  const appliedJobIds = await Application.find({
    provider: req.user.id,
    status: { $ne: "rejected" },
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
    .populate({ path: "client", select: "name location" });

  res.json({ jobs });
});
