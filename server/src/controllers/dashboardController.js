/**
 * Dashboard Controller
 * 
 * Aggregates data for different user roles (Client, Provider, Admin).
 * Provides metrics, charts, and summary data.
 */

const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const Review = require("../models/Review");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const MONTHS_TO_TRACK = 6;

const mapProviderSummary = (provider) => ({
  _id: provider.id,
  name: provider.name,
  primarySkill: provider.skills?.[0] ?? "",
  skills: provider.skills,
  rating: provider.rating,
  completedJobs: provider.completedJobs,
  experience: provider.experienceYears,
  hourlyRate: provider.hourlyRate,
  status: provider.status === "active" ? "available" : "unavailable",
  location: provider.location,
  avatarUrl: provider.avatarUrl,
});

const mapNotificationSummary = (notification) => ({
  _id: notification.id,
  title: notification.title,
  body: notification.body,
  type: notification.type,
  timeStamp: notification.createdAt,
  isRead: notification.isRead,
});

const buildMonthBuckets = () => {
  const now = new Date();
  return Array.from({ length: MONTHS_TO_TRACK }).map((_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (MONTHS_TO_TRACK - 1 - index),
      1
    );
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // human readable month
      label: date.toLocaleString("en-US", { month: "short" }),
    };
  });
};

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
 * Get Client Dashboard Data
 * 
 * Includes active job counts, spendings, and recommended providers.
 * 
 * @route GET /api/dashboard/client
 * @access Private (Client)
 */
exports.getClientDashboard = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ client: req.user.id })
    .sort({ createdAt: -1 })
    .limit(100);

  const activeJobs = jobs.filter((job) => job.status === "open");
  const completedJobs = jobs.filter((job) => job.status === "completed");

  const metrics = {
    activeJobs: activeJobs.length,
    totalApplicants: jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0),
    completedJobs: completedJobs.length,
    totalSpent: completedJobs.reduce((sum, job) => sum + (job.budget || 0), 0),
  };

  // Get all active providers
  const allProviders = await User.find({
    role: "provider",
    status: "active",
  });

  // Filter providers within 20km if client has coordinates
  let recommendedProviders = allProviders;
  if (req.user.coordinates?.latitude && req.user.coordinates?.longitude) {
    const clientLat = req.user.coordinates.latitude;
    const clientLon = req.user.coordinates.longitude;
    
    recommendedProviders = allProviders.filter(provider => {
      if (!provider.coordinates?.latitude || !provider.coordinates?.longitude) {
        return false; // Exclude providers without coordinates
      }
      const distance = calculateDistance(
        clientLat,
        clientLon,
        provider.coordinates.latitude,
        provider.coordinates.longitude
      );
      return distance <= 20; // Within 20km
    });
  }
  
  // Sort by rating and completed jobs, limit to 6
  recommendedProviders = recommendedProviders
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.completedJobs - a.completedJobs;
    })
    .slice(0, 6);

  const warnings = await Notification.find({
    recipient: req.user.id,
    type: "warning",
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .limit(3);

  res.json({
    metrics,
    recommendedProviders: recommendedProviders.map(mapProviderSummary),
    activeJobs,
    warnings: warnings.map(mapNotificationSummary),
  });
});

/**
 * Get Provider Dashboard Data
 * 
 * Includes earnings, active applications, and recommended jobs.
 * 
 * @route GET /api/dashboard/provider
 * @access Private (Provider)
 */
exports.getProviderDashboard = asyncHandler(async (req, res) => {
  const providerId = req.user.id;

  const activeApplications = await Application.countDocuments({
    provider: providerId,
    status: { $in: ["applied", "shortlisted", "hired"] },
  });

  const completedJobs = await Job.countDocuments({
    assignedProvider: providerId,
    status: "completed",
  });

  const totalEarningsAgg = await Job.aggregate([
    { $match: { assignedProvider: new mongoose.Types.ObjectId(providerId), status: "completed" } },
    { $group: { _id: null, total: { $sum: "$budget" } } },
  ]);

  const totalEarnings = totalEarningsAgg[0]?.total ?? 0;

  const ongoingJobs = await Job.find({
    assignedProvider: providerId,
    status: "in-progress",
  })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate({ path: "client", select: "name" });

  const recentNotifications = await Notification.find({ recipient: providerId })
    .sort({ createdAt: -1 })
    .limit(4);

  const warnings = await Notification.find({
    recipient: providerId,
    type: "warning",
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .limit(3);

  // Get job recommendations based on skills and location (20km)
  const provider = await User.findById(providerId);
  const providerSkills = provider.skills || [];
  
  // Find open jobs matching skills
  const matchingJobs = await Job.find({
    status: "open",
    requiredSkill: { $in: providerSkills }
  }).populate("client");

  // Filter by location (20km) if provider has coordinates
  let recommendedJobs = matchingJobs;
  if (provider.coordinates?.latitude && provider.coordinates?.longitude) {
    const providerLat = provider.coordinates.latitude;
    const providerLon = provider.coordinates.longitude;

    recommendedJobs = matchingJobs.filter(job => {
      // If job has specific location coordinates (future feature), use them
      // For now, check client's location
      const client = job.client;
      if (!client?.coordinates?.latitude || !client?.coordinates?.longitude) {
        return false;
      }

      const distance = calculateDistance(
        providerLat,
        providerLon,
        client.coordinates.latitude,
        client.coordinates.longitude
      );
      return distance <= 20;
    });
  }

  // Limit to 5 recommendations
  recommendedJobs = recommendedJobs.slice(0, 5);

  res.json({
    welcomeMessage: `Hello ${req.user.name.split(" ")[0] || "there"}!`,
    subheading: "You have personalised job recommendations waiting.",
    metrics: {
      activeApplications,
      completedJobs,
      totalEarnings,
      averageRating: req.user.rating || 0,
    },
    ongoingJobs: ongoingJobs.map((job) => ({
      _id: job.id,
      title: job.title,
      status: job.status,
      clientName: job.client?.name,
    })),
    recommendedJobs: recommendedJobs.map(job => ({
      _id: job.id,
      title: job.title,
      budget: job.budget,
      location: job.location,
      clientName: job.client?.name,
      postedAt: job.createdAt
    })),
    recentNotifications: recentNotifications.map(mapNotificationSummary),
    warnings: warnings.map(mapNotificationSummary),
  });
});

/**
 * Get Admin Dashboard Data
 * 
 * Comprehensive system overview: revenue, user growth, reports, etc.
 * 
 * @route GET /api/dashboard/admin
 * @access Private (Admin)
 */
exports.getAdminDashboard = asyncHandler(async (_req, res) => {
  const monthBuckets = buildMonthBuckets();
  const firstBucket = monthBuckets[0];
  const sixMonthsAgo = new Date(firstBucket.year, firstBucket.month - 1, 1);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeJobs,
    pendingReportsCount,
    revenueAgg,
    jobStatusAgg,
    roleDistributionAgg,
    userGrowthAgg,
    reportVolumeAgg,
    resolutionAgg,
    warningsLast30Days,
    suspensionCount,
    banCount,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments({ status: { $in: ["open", "in-progress"] } }),
    Report.countDocuments({ status: "pending" }),
    Job.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, revenue: { $sum: "$budget" } } },
    ]),
    Job.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
    User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Report.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]),
    Report.aggregate([
      {
        $match: {
          status: { $in: ["resolved", "rejected"] },
          updatedAt: { $ne: null },
        },
      },
      {
        $project: {
          avgHours: {
            $divide: [{ $subtract: ["$updatedAt", "$createdAt"] }, 1000 * 60 * 60],
          },
        },
      },
      { $group: { _id: null, avgHours: { $avg: "$avgHours" } } },
    ]),
    Notification.countDocuments({
      type: "warning",
      createdAt: { $gte: thirtyDaysAgo },
    }),
    Report.countDocuments({ actionTaken: "suspend" }),
    Report.countDocuments({ actionTaken: "ban" }),
  ]);

  const pendingReports = await Report.find({ status: "pending" })
    .sort({ createdAt: -1 })
    .limit(5);

  const topProviders = await User.find({ role: "provider" })
    .sort({ rating: -1, completedJobs: -1 })
    .limit(5);

  const mapByKey = (aggregates) =>
    aggregates.reduce((acc, item) => {
      const key = `${item._id.year}-${item._id.month}`;
      acc[key] = item.count;
      return acc;
    }, {});

  const userGrowthMap = mapByKey(userGrowthAgg);
  const reportVolumeMap = mapByKey(reportVolumeAgg);

  const userGrowth = monthBuckets.map((bucket) => ({
    name: bucket.label,
    value: userGrowthMap[`${bucket.year}-${bucket.month}`] ?? 0,
  }));

  const reportVolume = monthBuckets.map((bucket) => ({
    name: bucket.label,
    value: reportVolumeMap[`${bucket.year}-${bucket.month}`] ?? 0,
  }));

  const jobStatusMap = jobStatusAgg.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const jobStatusOrder = ["open", "in-progress", "completed", "cancelled"];
  const jobStatus = jobStatusOrder.map((status) => ({
    name: status,
    value: jobStatusMap[status] ?? 0,
  }));

  const roleDistributionMap = roleDistributionAgg.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const roles = ["client", "provider", "admin"];
  const roleDistribution = roles.map((role) => ({
    name: role,
    value: roleDistributionMap[role] ?? 0,
  }));

  const avgResolutionHours = Number(
    (resolutionAgg[0]?.avgHours ?? 0).toFixed(1)
  );

  res.json({
    metrics: {
      totalUsers,
      activeJobs,
      pendingReports: pendingReportsCount,
      revenue: revenueAgg[0]?.revenue ?? 0,
    },
    insights: {
      avgResolutionHours,
      warningsLast30Days,
      suspensions: suspensionCount,
      bans: banCount,
    },
    charts: {
      userGrowth,
      jobStatus,
      roleDistribution,
      reportVolume,
    },
    pendingReports: pendingReports.map((report) => ({
      _id: report.id,
      reason: report.reason,
      reasonLabel: report.reason,
      description: report.description,
      createdAt: report.createdAt,
    })),
    topProviders: topProviders.map(mapProviderSummary),
  });
});

/**
 * Get Provider Earnings Details
 * 
 * Detailed breakdown of earnings history and completed jobs.
 * 
 * @route GET /api/dashboard/provider/earnings
 * @access Private (Provider)
 */
exports.getProviderEarnings = asyncHandler(async (req, res) => {
  const providerId = req.user.id;

  const metrics = {
    totalEarnings: 0,
    thisMonth: 0,
    averageRating: req.user.rating || 0,
    jobsCompleted: 0,
  };

  const completedJobs = await Job.find({
    assignedProvider: providerId,
    status: "completed",
  })
    .sort({ completedAt: -1, updatedAt: -1 })
    .limit(50)
    .populate({ path: "client", select: "name" });

  metrics.jobsCompleted = completedJobs.length;
  metrics.totalEarnings = completedJobs.reduce((sum, job) => sum + (job.budget || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  metrics.thisMonth = completedJobs
    .filter((job) => {
      const date = job.updatedAt || job.createdAt;
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    })
    .reduce((sum, job) => sum + (job.budget || 0), 0);

  const months = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(currentYear, currentMonth - (5 - index), 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    return { key, label: date.toLocaleString("en-US", { month: "short" }) };
  });

  const earningsByMonth = completedJobs.reduce((acc, job) => {
    const date = job.updatedAt || job.createdAt;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    acc[key] = (acc[key] || 0) + (job.budget || 0);
    return acc;
  }, {});

  const chart = months.map((month) => ({
    name: month.label,
    earnings: earningsByMonth[month.key] || 0,
  }));

  const recentJobs = await Promise.all(
    completedJobs.slice(0, 5).map(async (job) => {
      const review = await Review.findOne({ job: job.id, provider: providerId });
      return {
        job: job.title,
        client: job.client?.name,
        date: job.updatedAt,
        payment: job.budget,
        rating: review?.rating,
      };
    })
  );

  res.json({
    metrics,
    chart,
    recentJobs,
  });
});

/**
 * Get Client History
 * 
 * List of past jobs with status and reviews.
 * 
 * @route GET /api/dashboard/client/history
 * @access Private (Client)
 */
exports.getClientHistory = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ client: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate({ path: "assignedProvider", select: "name skills avatarUrl" });

  const summary = {
    totalJobs: jobs.length,
    completed: jobs.filter((job) => job.status === "completed").length,
    inProgress: jobs.filter((job) => job.status === "in-progress").length,
    cancelled: jobs.filter((job) => job.status === "cancelled").length,
  };

  const jobIds = jobs.map((job) => job.id);
  const reviews = await Review.find({
    job: { $in: jobIds },
    reviewerRole: "client",
  });
  const reviewByJob = reviews.reduce((acc, review) => {
    acc[review.job.toString()] = review;
    return acc;
  }, {});

  const history = jobs.map((job) => {
    const review = reviewByJob[job.id];
    return {
      _id: job.id,
      title: job.title,
      budget: job.budget,
      status: job.status,
      paymentStatus: job.paymentStatus,
      datePosted: job.createdAt,
      dateCompleted: job.status === "completed" ? job.updatedAt : null,
      provider: job.assignedProvider
        ? {
            id: job.assignedProvider.id,
            name: job.assignedProvider.name,
            skill: job.assignedProvider.skills?.[0],
            avatarUrl: job.assignedProvider.avatarUrl,
          }
        : null,
      review: review
        ? {
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
          }
        : null,
    };
  });

  const pendingReviewCount = history.filter(
    (job) => job.status === "completed" && !job.review
  ).length;

  res.json({
    summary,
    pendingReviewCount,
    jobs: history,
  });
});
