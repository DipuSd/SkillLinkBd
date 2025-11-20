import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ProviderApplicationCards from "../../components/ProviderApplicationCards";
import ReviewModal from "../../components/ReviewModal";
import ReportUserModal from "../../components/ReportUserModal";
import {
  getApplications,
  updateApplicationStatus,
} from "../../api/applications";
import { createReview } from "../../api/reviews";
import { createReport } from "../../api/reports";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "applied" },
  { label: "Hired", value: "hired" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Withdrawn", value: "withdrawn" },
];

const statusLabels = {
  applied: "Pending",
  shortlisted: "Shortlisted",
  hired: "Hired",
  completed: "Completed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export default function ProviderApplications() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const applicationsQuery = useQuery({
    queryKey: ["provider-applications", statusFilter],
    queryFn: () =>
      getApplications({
        scope: "provider",
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    staleTime: 30_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-applications"] });
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const applications = useMemo(
    () => applicationsQuery.data?.applications ?? [],
    [applicationsQuery.data]
  );

  const reviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-applications"] });
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const cardItems = useMemo(
    () =>
      applications.map((application) => {
        const job = application.job ?? {};
        const createdAt = application.createdAt
          ? new Date(application.createdAt)
          : null;
        const clientId = job.client?._id || job.client?.id;
        const jobStatus = job.status;

        return {
          id: application._id,
          status: application.status,
          statusLabel: statusLabels[application.status] ?? application.status,
          title: job.title ?? "Untitled Job",
          clientName: job.client?.name ?? "Client",
          budget: job.budget ?? application.proposedBudget ?? 0,
          timeLabel: createdAt
            ? createdAt.toLocaleString()
            : "Recently",
          canWithdraw: ["applied", "shortlisted", "hired"].includes(
            application.status
          ),
          canComplete: application.status === "hired",
          jobId: job._id || job.id,
          clientId,
          jobStatus,
          canRateClient:
            jobStatus === "completed" &&
            !application.providerReviewSubmitted,
          canReport:
            Boolean(clientId) &&
            ["hired", "completed", "in-progress"].includes(jobStatus),
        };
      }),
    [applications]
  );

  const handleWithdraw = async (item) => {
    await updateStatusMutation.mutateAsync({
      applicationId: item.id,
      status: "withdrawn",
    });
  };

  const handleMarkComplete = async (item) => {
    if (!window.confirm(`Are you sure you want to mark "${item.title}" as completed? This will delete all chat messages for this job.`)) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: item.id,
        status: "completed",
      });
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    } catch (error) {
      console.error("Error marking job as complete:", error);
      alert(error?.response?.data?.message || "Failed to mark job as complete. Please try again.");
    }
  };

  const handleChat = (item) => {
    if (!item.clientId) return;
    navigate(`/provider/chat?user=${item.clientId}&jobId=${item.jobId}`);
  };

  return (
    <>
      <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5">
        <div>
          <h1 className="text-xl font-semibold">My Applications</h1>
          <p className="text-gray-500">
            Track all your job applications and their status.
          </p>
        </div>

        <div className="flex items-center p-1 bg-gray-200 rounded-full space-x-2 font-semibold max-w-full md:max-w-3xl">
          {statusFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 md:px-4 py-1 rounded-full flex-1 cursor-pointer transition-colors text-sm ${
                statusFilter === option.value ? "bg-white" : "text-gray-500"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5 pb-10">
          {applicationsQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-48 rounded-xl border border-gray-200 bg-gray-100 animate-pulse"
              ></div>
            ))
          ) : (
            <ProviderApplicationCards
              items={cardItems}
              onChat={handleChat}
              onWithdraw={handleWithdraw}
              onMarkComplete={handleMarkComplete}
              onRateClient={(item) => setReviewTarget(item)}
              onReportClient={(item) => setReportTarget(item)}
            />
          )}
        </div>
      </div>

      <ReviewModal
        isOpen={Boolean(reviewTarget)}
        onClose={() => {
          if (reviewMutation.isPending) return;
          setReviewTarget(null);
        }}
        job={
          reviewTarget && {
            id: reviewTarget.jobId,
            title: reviewTarget.title,
            userName: reviewTarget.clientName,
          }
        }
        onSubmit={async (payload) => {
          try {
            await reviewMutation.mutateAsync(payload);
            setReviewTarget(null);
          } catch (error) {
            // handled via modal
          }
        }}
        isSubmitting={reviewMutation.isPending}
        error={reviewMutation.error?.response?.data?.message}
      />

      <ReportUserModal
        isOpen={Boolean(reportTarget)}
        onClose={() => {
          if (reportMutation.isPending) return;
          setReportTarget(null);
        }}
        subjectName={reportTarget?.clientName}
        subjectRoleLabel="client"
        context={reportTarget?.title}
        onSubmit={async ({ reason, description, evidenceUrl }) => {
          if (!reportTarget?.clientId) return;
          try {
            await reportMutation.mutateAsync({
              reportedUserId: reportTarget.clientId,
              reason,
              description,
              evidenceUrl,
              jobId: reportTarget.jobId,
            });
            setReportTarget(null);
          } catch (error) {
            // handled via modal
          }
        }}
        isSubmitting={reportMutation.isPending}
        error={reportMutation.error?.response?.data?.message}
      />
    </>
  );
}
