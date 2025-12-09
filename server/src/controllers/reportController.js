/**
 * Report Controller
 * 
 * Handles creation and management of user reports.
 * Allows admins to view, update, and resolve reports (including banning users).
 */

const createError = require("http-errors");
const Report = require("../models/Report");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { notifyUser } = require("../services/notificationService");

/**
 * Create a new report against a user
 * 
 * @route POST /api/reports
 * @access Private
 */
exports.createReport = asyncHandler(async (req, res) => {
  const { reportedUserId, reason, description, evidenceUrl, jobId, directJobId } = req.body;

  if (reportedUserId === req.user.id) {
    throw createError(400, "You cannot report yourself");
  }

  const reportedUser = await User.findById(reportedUserId);
  if (!reportedUser) {
    throw createError(404, "Reported user not found");
  }

  const payload = {
    reporter: req.user.id,
    reportedUser: reportedUserId,
    reason,
    description,
    evidenceUrl,
  };

  if (jobId) {
    payload.job = jobId;
  }

  if (directJobId) {
    payload.directJob = directJobId;
  }

  const report = await Report.create(payload);

  res.status(201).json({ report });
});

/**
 * Get reports with filtering
 * 
 * Admins can view all reports, users can view their own filed reports.
 * 
 * @route GET /api/reports
 * @access Private
 */
exports.getReports = asyncHandler(async (req, res) => {
  const { status, scope } = req.query;

  const filters = {};

  if (status) {
    filters.status = status;
  }

  if (req.user.role === "admin") {
    if (scope === "mine") {
      filters.reporter = req.user.id;
    }
  } else {
    filters.reporter = req.user.id;
  }

  const reports = await Report.find(filters)
    .sort({ createdAt: -1 })
    .limit(200)
    .populate({ path: "reporter", select: "name email" })
    .populate({ path: "reportedUser", select: "name email" })
    .populate({ path: "reviewedBy", select: "name" })
    .populate({ path: "job", select: "title status" })
    .populate({ path: "directJob", select: "title status" });

  res.json({ reports });
});

/**
 * Update report status (Admin only)
 * 
 * Handles resolution, rejection, and punitive actions (warn, suspend, ban).
 * Notifies reporter and reported user (if warned) of the outcome.
 * 
 * @route PATCH /api/reports/:id
 * @access Private (Admin)
 */
exports.updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, actionTaken, warningMessage } = req.body;
  const io = req.app.get("socket");

  if (!status || !["pending", "resolved", "rejected"].includes(status)) {
    throw createError(400, "Invalid status value");
  }

  const report = await Report.findById(id);
  if (!report) {
    throw createError(404, "Report not found");
  }

  if (req.user.role !== "admin") {
    throw createError(403, "Only admins can update reports");
  }

  const trimmedWarning = typeof warningMessage === "string" ? warningMessage.trim() : "";

  if (actionTaken === "warning" && !trimmedWarning) {
    throw createError(400, "Warning message is required");
  }

  report.status = status;
  report.actionTaken = actionTaken ?? null;
  report.reviewedBy = req.user.id;
  await report.save();

  if (actionTaken && ["suspend", "ban"].includes(actionTaken)) {
    const nextStatus = actionTaken === "ban" ? "banned" : "suspended";
    await User.findByIdAndUpdate(report.reportedUser, {
      status: nextStatus,
      isBanned: nextStatus === "banned",
    });
  }

  const reporterNotification = notifyUser({
    recipient: report.reporter,
    title: "Report update",
    body: `Your report against user ${report.reportedUser.toString()} is now ${status}`,
    type: "info",
    metadata: { reportId: report.id },
    io,
  });

  if (actionTaken === "warning") {
    await notifyUser({
      recipient: report.reportedUser,
      title: "Account Warning",
      body: trimmedWarning,
      type: "warning",
      metadata: { reportId: report.id },
      io,
    });
  }

  await reporterNotification;

  res.json({ report });
});
