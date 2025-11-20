import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getDirectJobs, updateDirectJobStatus } from "../../api/directJobs";
import { createReport } from "../../api/reports";
import ReportUserModal from "../../components/ReportUserModal";

export default function ProviderDirectJobs() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [reportTarget, setReportTarget] = useState(null);

  const directJobsQuery = useQuery({
    queryKey: ["direct-jobs", "provider"],
    queryFn: () => getDirectJobs({ scope: "provider" }),
    staleTime: 15_000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateDirectJobStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["direct-jobs", "provider"] });
    },
  });

  const reportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const directJobs = directJobsQuery.data?.directJobs ?? [];

  const requests = useMemo(
    () => directJobs.filter((job) => job.status === "requested"),
    [directJobs]
  );
  const active = useMemo(
    () => directJobs.filter((job) => job.status === "in-progress"),
    [directJobs]
  );
  const history = useMemo(
    () =>
      directJobs.filter((job) =>
        ["completed", "declined", "cancelled"].includes(job.status)
      ),
    [directJobs]
  );

  const handleStatusChange = async (jobId, action) => {
    await updateStatusMutation.mutateAsync({ directJobId: jobId, action });
  };

  return (
    <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Direct Invitations</h1>
        <p className="text-gray-500">
          Manage private job requests from clients outside the public listings.
        </p>
      </header>

      <Section
        title="New requests"
        subtitle="Review and respond to client invites."
        isLoading={directJobsQuery.isLoading}
        emptyMessage="No pending invitations right now."
      >
        {requests.map((job) => (
          <ProviderDirectJobCard
            key={job._id}
            job={job}
            actions={[
              {
                label: "Accept",
                variant: "primary",
                onClick: () => handleStatusChange(job._id, "accept"),
                loading: updateStatusMutation.isPending,
              },
              {
                label: "Decline",
                variant: "danger",
                onClick: () => handleStatusChange(job._id, "decline"),
                loading: updateStatusMutation.isPending,
              },
            ]}
            onMessage={() => navigate(`/provider/chat?user=${job.client?._id}`)}
          />
        ))}
      </Section>

      <Section
        title="Active"
        subtitle="Jobs you have accepted and are currently delivering."
        isLoading={directJobsQuery.isLoading}
        emptyMessage="Accept an invite to see it here."
      >
        {active.map((job) => (
          <ProviderDirectJobCard
            key={job._id}
            job={job}
            actions={[
              {
                label: "Mark complete",
                variant: "primary",
                onClick: () => handleStatusChange(job._id, "complete"),
                loading: updateStatusMutation.isPending,
              },
              {
                label: "Report",
                variant: "ghost",
                onClick: () =>
                  setReportTarget({
                    jobId: job._id,
                    clientId: job.client?._id,
                    clientName: job.client?.name,
                    title: job.title,
                  }),
              },
            ]}
            onMessage={() => navigate(`/provider/chat?user=${job.client?._id}`)}
          />
        ))}
      </Section>

      <Section
        title="History"
        subtitle="Recently completed or closed direct jobs."
        isLoading={directJobsQuery.isLoading}
        emptyMessage="No history yet."
      >
        {history.map((job) => (
          <ProviderDirectJobCard key={job._id} job={job} compact />
        ))}
      </Section>

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
              directJobId: reportTarget.jobId,
            });
            setReportTarget(null);
          } catch (error) {
            // handled via modal
          }
        }}
        isSubmitting={reportMutation.isPending}
        error={reportMutation.error?.response?.data?.message}
      />
    </div>
  );
}

function Section({ title, subtitle, children, emptyMessage, isLoading }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"
            ></div>
          ))}
        </div>
      ) : Array.isArray(children) && children.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}

function ProviderDirectJobCard({ job, actions = [], onMessage, compact = false }) {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Client</p>
          <h4 className="text-lg font-semibold text-gray-900">
            {job.client?.name ?? "Client"}
          </h4>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            job.status === "completed"
              ? "bg-green-100 text-green-700"
              : job.status === "in-progress"
              ? "bg-blue-100 text-blue-700"
              : job.status === "requested"
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {job.status.replace("-", " ")}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{job.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3">
          {job.description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        {job.budget ? (
          <span className="font-semibold text-green-600">
            Budget: ৳{job.budget}
          </span>
        ) : null}
        {job.location ? <span>{job.location}</span> : null}
        {job.preferredDate ? (
          <span>
            Preferred: {new Date(job.preferredDate).toLocaleDateString()}
          </span>
        ) : null}
      </div>
      {!compact ? (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-2">
          {onMessage ? (
            <button
              type="button"
              onClick={onMessage}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 font-semibold text-gray-700 hover:bg-green-500 hover:text-white transition-colors"
            >
              Message
            </button>
          ) : null}
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              disabled={action.loading}
              className={`flex-1 rounded-lg px-3 py-2 font-semibold transition-colors ${
                action.variant === "primary"
                  ? "border border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white"
                  : action.variant === "danger"
                  ? "border border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-100"
              } disabled:opacity-50`}
            >
              {action.loading ? "Working..." : action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

