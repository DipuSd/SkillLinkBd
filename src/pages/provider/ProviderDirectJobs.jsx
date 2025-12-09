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

      {/* New Requests Table */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">New requests</h2>
          <p className="text-sm text-gray-500">Review and respond to client invites.</p>
        </div>
        {directJobsQuery.isLoading ? (
          <div className="h-32 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"></div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400">No pending invitations right now.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {job.client?.name ?? "Client"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-800 font-medium">{job.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{job.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {job.budget ? (
                        <span className="text-sm font-semibold text-green-600">৳{job.budget}</span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{job.location || "N/A"}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-orange-100 text-orange-700">
                        {job.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/chat?user=${job.client?._id}`)}
                          className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-green-500 hover:text-white transition-colors font-semibold"
                        >
                          Message
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(job._id, "accept")}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors font-semibold disabled:opacity-50"
                        >
                          {updateStatusMutation.isPending ? "Working..." : "Accept"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(job._id, "decline")}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1 rounded-lg border border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-semibold disabled:opacity-50"
                        >
                          {updateStatusMutation.isPending ? "Working..." : "Decline"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active Jobs Table */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Active</h2>
          <p className="text-sm text-gray-500">Jobs you have accepted and are currently delivering.</p>
        </div>
        {directJobsQuery.isLoading ? (
          <div className="h-32 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"></div>
        ) : active.length === 0 ? (
          <p className="text-sm text-gray-400">Accept an invite to see it here.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {active.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {job.client?.name ?? "Client"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-800 font-medium">{job.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{job.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {job.budget ? (
                        <span className="text-sm font-semibold text-green-600">৳{job.budget}</span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{job.location || "N/A"}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-blue-100 text-blue-700">
                        {job.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/provider/chat?user=${job.client?._id}`)}
                          className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-green-500 hover:text-white transition-colors font-semibold"
                        >
                          Message
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(job._id, "complete")}
                          disabled={updateStatusMutation.isPending}
                          className="px-3 py-1 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors font-semibold disabled:opacity-50"
                        >
                          {updateStatusMutation.isPending ? "Working..." : "Mark Complete"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({
                              jobId: job._id,
                              clientId: job.client?._id,
                              clientName: job.client?.name,
                              title: job.title,
                            })
                          }
                          className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors font-semibold"
                        >
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* History Table */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">History</h2>
          <p className="text-sm text-gray-500">Recently completed or closed direct jobs.</p>
        </div>
        {directJobsQuery.isLoading ? (
          <div className="h-32 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"></div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">No history yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {job.client?.name ?? "Client"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-800 font-medium">{job.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-2">{job.description}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {job.budget ? (
                        <span className="text-sm font-semibold text-green-600">৳{job.budget}</span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{job.location || "N/A"}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            job.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {job.status.replace("-", " ")}
                        </span>
                        {job.status === "completed" && job.paymentStatus !== "paid" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 border border-orange-200">
                            Unpaid
                          </span>
                        ) : job.status === "completed" && job.paymentStatus === "paid" ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600 border border-green-200">
                            Paid
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {job.status === "completed" ? (
                        <button
                          type="button"
                          onClick={() =>
                            setReportTarget({
                              jobId: job._id,
                              clientId: job.client?._id,
                              clientName: job.client?.name,
                              title: job.title,
                            })
                          }
                          className="px-3 py-1 rounded-lg border border-gray-300 text-gray-600 hover:bg-red-500 hover:text-white transition-colors font-semibold"
                        >
                          Report
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
