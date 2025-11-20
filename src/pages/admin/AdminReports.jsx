import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReports, updateReportStatus } from "../../api/reports";

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Resolved", value: "resolved" },
  { label: "Rejected", value: "rejected" },
];

function AdminReports() {
  const [status, setStatus] = useState("pending");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", { status }],
    queryFn: () =>
      getReports({
        status: status === "all" ? undefined : status,
      }),
    staleTime: 30_000,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateReportStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
  });

  const handleAction = async (reportId, nextStatus) => {
    await mutateAsync({ reportId, status: nextStatus });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">User Reports</h1>
        <p className="text-gray-500">
          Review and act on user misconduct reports to maintain platform trust.
        </p>
      </header>

      <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 w-full md:w-fit">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatus(filter.value)}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${
              status === filter.value
                ? "bg-white text-cyan-600 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reporter
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reported
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  Loading reports...
                </td>
              </tr>
            ) : (data?.reports ?? []).length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-400 text-sm"
                >
                  No reports found for this filter.
                </td>
              </tr>
            ) : (
              data.reports.map((report) => (
                <tr key={report._id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {report.reporter?.name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {report.reporter?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {report.reported?.name ?? "Unknown"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {report.reported?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="font-medium capitalize">
                      {report.reasonLabel ?? report.reason}
                    </div>
                    <div className="text-xs text-gray-400 line-clamp-2">
                      {report.description}
                    </div>
                    {report.evidenceUrl ? (
                      <a
                        href={report.evidenceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-cyan-600 underline"
                      >
                        View evidence
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500 text-sm">
                    {new Date(report.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleAction(report._id, "resolved")}
                        disabled={isPending}
                        className="px-3 py-1 rounded-lg text-sm font-semibold border border-green-500 text-green-600 hover:bg-green-50 disabled:opacity-60"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleAction(report._id, "rejected")}
                        disabled={isPending}
                        className="px-3 py-1 rounded-lg text-sm font-semibold border border-red-500 text-red-500 hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminReports;

