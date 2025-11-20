const createError = require("http-errors");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const User = require("../models/User");
const Review = require("../models/Review");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const asyncHandler = require("../utils/asyncHandler");
const { notifyUser } = require("../services/notificationService");

const deleteJobConversations = async ({ jobId, participantIds = [] }) => {
  if (!jobId) {
    return;
  }

  const normalizedJobId =
    jobId instanceof mongoose.Types.ObjectId || !mongoose.Types.ObjectId.isValid(jobId)
      ? jobId
      : new mongoose.Types.ObjectId(jobId);

  const query = { job: normalizedJobId };

  if (participantIds.length === 2) {
    const objectIds = participantIds
      .map((id) => {
        if (!id) return null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        if (id._id && mongoose.Types.ObjectId.isValid(id._id)) {
          return new mongoose.Types.ObjectId(id._id);
        }
        if (typeof id.toString === "function" && mongoose.Types.ObjectId.isValid(id.toString())) {
          return new mongoose.Types.ObjectId(id.toString());
        }
        return null;
      })
      .filter(Boolean);

    if (objectIds.length === 2) {
      query.participants = { $all: objectIds };
    }
  }

  const conversations = await Conversation.find(query);
  if (!conversations.length) {
    return;
  }

  const conversationIds = conversations.map((conversation) => conversation._id);
  await Message.deleteMany({ conversation: { $in: conversationIds } });
  await Conversation.deleteMany({ _id: { $in: conversationIds } });
};

exports.applyToJob = asyncHandler(async (req, res) => {
  if (req.user.role !== "provider") {
    throw createError(403, "Only providers can apply to jobs");
  }

  const { jobId, message, proposedBudget } = req.body;
  const job = await Job.findById(jobId);

  if (!job || job.status !== "open") {
    throw createError(400, "Job is not available");
  }

  if (job.client.toString() === req.user.id) {
    throw createError(400, "You cannot apply to your own job");
  }

  const existing = await Application.findOne({
    job: jobId,
    provider: req.user.id,
  });

  if (existing) {
    throw createError(400, "You have already applied to this job");
  }

  const application = await Application.create({
    job: jobId,
    provider: req.user.id,
    client: job.client,
    message,
    proposedBudget,
  });

  job.applicantCount += 1;
  await job.save({ validateBeforeSave: false });

  await notifyUser({
    recipient: job.client,
    title: "New application received",
    body: `${req.user.name} applied to ${job.title}`,
    link: `/client/applicants?jobId=${job.id}`,
    metadata: { jobId: job.id, providerId: req.user.id },
    io: req.app.get("socket"),
  });

  res.status(201).json({ application });
});

exports.getApplications = asyncHandler(async (req, res) => {
  const { scope, jobId, status } = req.query;

  let filters = {};

  if (scope === "client") {
    if (req.user.role !== "client" && req.user.role !== "admin") {
      throw createError(403, "Only clients can view job applications");
    }
    filters.client = req.user.id;
  } else {
    filters.provider = req.user.id;
  }

  if (jobId) {
    filters.job = jobId;
  }

  if (status && status !== "all") {
    filters.status = status;
  }

let applications = await Application.find(filters)
  .sort({ createdAt: -1 })
  .limit(200)
  .populate({
    path: "job",
    select: "title budget status client assignedProvider createdAt",
    populate: { path: "client", select: "name" },
  })
  .populate({
    path: "provider",
    select: "name skills rating location avatarUrl",
  });

let plainApplications = applications.map((application) =>
  application.toObject({ virtuals: true })
);

// Filter out applications for completed jobs when scope is "client"
if (scope === "client") {
  plainApplications = plainApplications.filter(
    (app) => app.job && app.job.status !== "completed"
  );
} else if (filters.provider) {
  const jobIds = plainApplications
    .map((app) => app.job?._id?.toString() || app.job?.id)
    .filter(Boolean);

  let providerReviewJobs = new Set();

  if (jobIds.length) {
    const reviews = await Review.find({
      job: { $in: jobIds },
      reviewerRole: "provider",
      provider: req.user.id,
    }).select("job");

    providerReviewJobs = new Set(reviews.map((review) => review.job.toString()));
  }

  plainApplications = plainApplications.map((app) => ({
    ...app,
    providerReviewSubmitted: providerReviewJobs.has(
      app.job?._id?.toString() || app.job?.id
    ),
  }));
}

res.json({ applications: plainApplications });
});

exports.updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  const io = req.app.get("socket");

  // eslint-disable-next-line no-console
  console.log("Update application status:", { applicationId, status, userId: req.user.id, role: req.user.role });

  if (!status) {
    throw createError(400, "Status is required");
  }

  const application = await Application.findById(applicationId).populate({
    path: "job",
    select: "title status client assignedProvider",
  });

  if (!application) {
    throw createError(404, "Application not found");
  }

  if (!application.job) {
    throw createError(404, "Job not found for this application");
  }

  // eslint-disable-next-line no-console
  console.log("Application found:", { 
    applicationId: application._id, 
    jobId: application.job._id,
    jobClient: application.job.client?.toString(), 
    currentUser: req.user.id,
    applicationStatus: application.status 
  });

  const job = application.job;

  if (req.user.role === "provider") {
    if (application.provider.toString() !== req.user.id) {
      throw createError(403, "You cannot update this application");
    }

    // Providers can withdraw or mark as completed
    if (!["withdrawn", "completed"].includes(status)) {
      throw createError(400, "Invalid status update. Providers can only withdraw or mark as completed.");
    }

    if (status === "withdrawn") {
      application.status = "withdrawn";
      await application.save();

      if (job.applicantCount > 0) {
        job.applicantCount -= 1;
      }

      const wasAssigned =
        job.assignedProvider?.toString() === application.provider.toString() ||
        job.hiredApplication?.toString() === application.id.toString();

      if (wasAssigned) {
        job.assignedProvider = undefined;
        job.hiredApplication = undefined;
        job.status = "open";
      }

      await job.save({ validateBeforeSave: false });

      const clientId = job.client?._id?.toString() || job.client?.toString();
      const providerId =
        application.provider?._id?.toString() ||
        application.provider?.toString();
      if (clientId && providerId) {
        await deleteJobConversations({
          jobId: job._id,
          participantIds: [providerId, clientId],
        });
      }

      await notifyUser({
        recipient: job.client,
        title: "Application withdrawn",
        body: `${req.user.name} withdrew their application for ${job.title}`,
        link: `/client/applicants?jobId=${job.id}`,
        metadata: { jobId: job.id },
        io,
      });

      return res.json({ application });
    }

    // Provider marking job as completed
    if (status === "completed") {
      // Only allow if application is hired
      if (application.status !== "hired") {
        throw createError(400, "You can only mark hired jobs as completed");
      }

      application.status = "completed";
      await application.save();

      // Update job status to completed
      job.status = "completed";
      await job.save();

      // Update provider's completed jobs count
      await User.findByIdAndUpdate(application.provider, {
        $inc: { completedJobs: 1 },
      });

      await deleteJobConversations({ jobId: job._id });

      await notifyUser({
        recipient: job.client,
        title: "Job completed",
        body: `${req.user.name} marked ${job.title} as completed`,
        link: `/client/history`,
        metadata: { jobId: job.id },
        io,
      });

      return res.json({ application });
    }
  }

  // Check if user is the job client or admin
  const jobClientId = job.client?._id?.toString() || job.client?.toString();
  const userId = req.user.id?.toString() || req.user._id?.toString();
  
  if (jobClientId !== userId && req.user.role !== "admin") {
    // eslint-disable-next-line no-console
    console.error("Authorization failed:", { jobClientId, userId, role: req.user.role });
    throw createError(403, "You cannot update this application. Only the job owner can update applications.");
  }

  if (!["shortlisted", "hired", "rejected", "completed"].includes(status)) {
    throw createError(400, "Invalid status update");
  }

  application.status = status;
  await application.save();

  if (status === "hired") {
    const alreadyAssigned =
      job.assignedProvider &&
      job.assignedProvider.toString() === application.provider.toString();

    if (!alreadyAssigned) {
      job.assignedProvider = application.provider;
      job.status = "in-progress";
      job.hiredApplication = application.id;
      await job.save();

      await Application.updateMany(
        { job: job.id, _id: { $ne: application.id } },
        { status: "rejected" }
      );

      await notifyUser({
        recipient: application.provider,
        title: "You've been hired",
        body: `${job.title} has been assigned to you`,
        type: "accept",
        link: `/provider/jobs/${job.id}`,
        metadata: { jobId: job.id },
        io,
      });
    } else if (job.status !== "in-progress") {
      job.status = "in-progress";
      await job.save();
    }
  }

  if (status === "completed") {
    // This is when client marks as completed
    job.status = "completed";
    await job.save();

    await User.findByIdAndUpdate(application.provider, {
      $inc: { completedJobs: 1 },
    });

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

  if (status === "rejected") {
    await notifyUser({
      recipient: application.provider,
      title: "Application update",
      body: `${job.title}: your application was rejected`,
      type: "reject",
      metadata: { jobId: job.id },
      io,
    });
  }

  res.json({ application });
});
