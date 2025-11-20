import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaRegCheckCircle } from "react-icons/fa";
import { IoBagCheckOutline } from "react-icons/io5";
import { FiClock } from "react-icons/fi";
import { RxCrossCircled } from "react-icons/rx";
import { FaRegStar } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { CiFilter } from "react-icons/ci";
import HistoryMetricsCards from "../../components/HistoryMetricsCards";
import CompletedJobsCard from "../../components/CompletedJobsCard";
import { getClientHistory } from "../../api/dashboard";
import { createReview } from "../../api/reviews";
import { createReport } from "../../api/reports";
import ReportUserModal from "../../components/ReportUserModal";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "In Progress", value: "in-progress" },
  { label: "Cancelled", value: "cancelled" },
];

const formatCurrency = (value) => `৳${Number(value || 0).toLocaleString()}`;

export default function ClientHistory() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTarget, setReportTarget] = useState(null);
  const [reportNotice, setReportNotice] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["client-history"],
    queryFn: getClientHistory,
    staleTime: 60_000,
  });

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-history"] });
      queryClient.invalidateQueries({ queryKey: ["client-dashboard"] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const handleReviewSubmit = async (reviewData) => {
    try {
      await reviewMutation.mutateAsync(reviewData);
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  const summary = useMemo(
    () =>
      data?.summary ?? {
        totalJobs: 0,
        completed: 0,
        inProgress: 0,
        cancelled: 0,
      },
    [data?.summary]
  );
  const jobs = useMemo(() => data?.jobs ?? [], [data?.jobs]);
  const pendingReviewCount = data?.pendingReviewCount ?? 0;

  const historyMetrics = useMemo(
    () => [
      {
        label: "Total Jobs",
        count: summary.totalJobs,
        icon: <IoBagCheckOutline color="blue" size={35} />,
      },
      {
        label: "Completed",
        count: summary.completed,
        icon: <FaRegCheckCircle color="teal" size={35} />,
      },
      {
        label: "In Progress",
        count: summary.inProgress,
        icon: <FiClock color="green" size={35} />,
      },
      {
        label: "Cancelled",
        count: summary.cancelled,
        icon: <RxCrossCircled color="red" size={35} />,
      },
    ],
    [summary]
  );

  const filteredJobs = useMemo(() => {
    const statusFiltered =
      statusFilter === "all"
        ? jobs
        : jobs.filter((job) => job.status === statusFilter);

    if (!searchTerm) return statusFiltered;

    const normalizedQuery = searchTerm.toLowerCase();

    return statusFiltered.filter((job) =>
      [job.title, job.provider?.name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [jobs, statusFilter, searchTerm]);

  const cards = filteredJobs.map((job) => {
    const statusLabel =
      job.status === "completed"
        ? "Completed"
        : job.status === "in-progress"
        ? "In Progress"
        : job.status === "cancelled"
        ? "Cancelled"
        : "Open";

    const reviewed = Boolean(job.review);

    return {
      id: job._id,
      title: job.title,
      profilePic: job.provider?.avatarUrl || "/sampleProfile.png",
      userName: job.provider?.name ?? "Provider",
      occupation: job.provider?.skill ?? "",
      budget: formatCurrency(job.budget),
      status: statusLabel,
      rawStatus: job.status,
      datePosted: job.datePosted
        ? new Date(job.datePosted).toLocaleDateString()
        : "",
      dateCompleted: job.dateCompleted
        ? new Date(job.dateCompleted).toLocaleDateString()
        : "",
      reviewed,
      rating: job.review?.rating,
      reviewComment: job.review?.comment,
      providerId: job.provider?.id,
      canReport:
        Boolean(job.provider?.id) &&
        ["completed", "in-progress", "cancelled"].includes(job.status),
    };
  });

  return (
    <div className="flex flex-col m-4 space-y-5">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">Job History</h1>
        <p className="text-gray-400 text-md">
          View and manage all your posted jobs.
        </p>
      </div>

      <HistoryMetricsCards items={historyMetrics} />

      {pendingReviewCount > 0 ? (
        <div className="flex flex-row items-center space-x-3 p-4 bg-teal-200/30 rounded-2xl border border-teal-400">
          <div className="text-white bg-gradient-to-r from-green-500 to-teal-400 p-2 rounded-full">
            <FaRegStar size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold text-lg text-gray-800">
              {pendingReviewCount} completed job(s) waiting for your review
            </h2>
            <p className="text-gray-500 text-sm">
              Help other clients by sharing your experience.
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-4 border border-gray-200 rounded-2xl p-4 bg-white">
        <div className="relative flex-1">
          <IoSearch size={18} className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by job title or provider..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-gray-100 focus:border focus:border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none placeholder-gray-400"
          />
        </div>
        <div className="relative w-full lg:w-64">
          <CiFilter size={18} className="absolute top-3 left-3 text-gray-400" />
          <select
            className="w-full py-2 pl-10 pr-3 bg-gray-100 focus:border focus:border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {statusFilters.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5 pb-10">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-60 bg-white border border-gray-200 rounded-2xl animate-pulse"
            ></div>
          ))
        ) : cards.length === 0 ? (
          <p className="text-gray-400 text-sm">
            No jobs found for this filter.
          </p>
        ) : (
          <CompletedJobsCard
            jobs={cards}
            onReviewSubmit={handleReviewSubmit}
            onReport={(job) => {
              setReportNotice("");
              setReportTarget(job);
            }}
          />
        )}
      </div>

      {reportNotice ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">
          {reportNotice}
        </div>
      ) : null}

      <ReportUserModal
        isOpen={Boolean(reportTarget)}
        onClose={() => {
          if (reportMutation.isPending) return;
          setReportTarget(null);
        }}
        subjectName={reportTarget?.userName}
        subjectRoleLabel="provider"
        context={reportTarget?.title}
        onSubmit={async (payload) => {
          if (!reportTarget?.providerId) return;
          try {
            await reportMutation.mutateAsync({
              reportedUserId: reportTarget.providerId,
              reason: payload.reason,
              description: payload.description,
              evidenceUrl: payload.evidenceUrl,
              jobId: reportTarget.id,
            });
            setReportNotice("Report submitted. Our team will review it shortly.");
            setReportTarget(null);
          } catch (error) {
            // handled below
          }
        }}
        isSubmitting={reportMutation.isPending}
        error={reportMutation.error?.response?.data?.message}
      />
    </div>
  );
}
