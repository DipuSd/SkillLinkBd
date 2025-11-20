import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createReport } from "../../api/reports";
import { getClientHistory } from "../../api/dashboard";
import { useAuth } from "../../context/AuthContext";
import { reportReasons } from "../../components/ReportUserModal";

const initialState = {
  reportedUserId: "",
  jobId: "",
  reason: "",
  description: "",
  evidenceUrl: "",
};

function ClientReports() {
  const [formData, setFormData] = useState(initialState);
  const [selectedOption, setSelectedOption] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const historyQuery = useQuery({
    queryKey: ["client-history", "reports"],
    queryFn: getClientHistory,
    staleTime: 60_000,
  });

  const providerOptions = useMemo(() => {
    const jobs = historyQuery.data?.jobs ?? [];
    const seen = new Set();
    return jobs
      .filter((job) => job.provider?.id)
      .map((job) => ({
        providerId: job.provider.id,
        jobId: job._id,
        label: `${job.provider.name} · ${job.title}`,
      }))
      .filter((option) => {
        const key = `${option.providerId}:${option.jobId}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [historyQuery.data]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProviderSelect = (event) => {
    const value = event.target.value;
    setSelectedOption(value);

    if (!value) {
      setFormData((prev) => ({ ...prev, reportedUserId: "", jobId: "" }));
      return;
    }

    if (value === "custom") {
      setFormData((prev) => ({ ...prev, reportedUserId: "", jobId: "" }));
      return;
    }

    const [reportedUserId, jobId] = value.split("::");
    setFormData((prev) => ({ ...prev, reportedUserId, jobId }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!formData.reportedUserId) {
      setErrorMessage("Please select or enter the provider you want to report.");
      return;
    }

    try {
      await mutateAsync({ ...formData, reporterId: user?._id });
      setSuccessMessage(
        "Report submitted successfully. Our moderators will review it soon."
      );
      setFormData(initialState);
      setSelectedOption("");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        "Could not submit the report. Please try again.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Report a User</h1>
        <p className="text-gray-500">
          Flag suspicious or abusive behaviour. Reports are reviewed by admins.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col space-y-1">
            <span className="text-sm font-semibold text-gray-700">
              Choose Provider
            </span>
            <select
              value={selectedOption}
              onChange={handleProviderSelect}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            >
              <option value="">Select a provider...</option>
              {providerOptions.map((option) => (
                <option
                  key={`${option.providerId}::${option.jobId}`}
                  value={`${option.providerId}::${option.jobId}`}
                >
                  {option.label}
                </option>
              ))}
              <option value="custom">Other (enter ID manually)</option>
            </select>
            <span className="text-xs text-gray-400">
              Pick from your recent jobs or enter an ID manually.
            </span>
          </label>

          <label className="flex flex-col space-y-1">
            <span className="text-sm font-semibold text-gray-700">Reason</span>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            >
              <option value="">Select a reason</option>
              {reportReasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedOption === "custom" || providerOptions.length === 0 ? (
          <label className="flex flex-col space-y-1">
            <span className="text-sm font-semibold text-gray-700">
              Provider User ID
            </span>
            <input
              required
              name="reportedUserId"
              value={formData.reportedUserId}
              onChange={handleChange}
              placeholder="Enter the provider's user ID"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
            />
            <span className="text-xs text-gray-400">
              The ID is visible on the provider's profile.
            </span>
          </label>
        ) : null}

        <label className="flex flex-col space-y-1">
          <span className="text-sm font-semibold text-gray-700">
            Description
          </span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
            placeholder="Describe what happened..."
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white resize-y"
          />
          <span className="text-xs text-gray-400">
            Include dates, job IDs, and any relevant details that can help our
            moderators review the case quickly.
          </span>
        </label>

        <label className="flex flex-col space-y-1">
          <span className="text-sm font-semibold text-gray-700">
            Evidence URL (optional)
          </span>
          <input
            type="url"
            name="evidenceUrl"
            value={formData.evidenceUrl}
            onChange={handleChange}
            placeholder="Link to screenshots, documents, etc."
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
          />
          <span className="text-xs text-gray-400">
            Provide a link to any supporting evidence (Google Drive, Dropbox,
            etc.).
          </span>
        </label>

        {successMessage ? (
          <p className="text-sm font-semibold text-green-600">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="text-sm font-semibold text-red-500">{errorMessage}</p>
        ) : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData(initialState);
              setSuccessMessage("");
              setErrorMessage("");
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {isPending ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClientReports;

