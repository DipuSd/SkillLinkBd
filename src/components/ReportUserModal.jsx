import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";

const reportReasons = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "fraud", label: "Fraud or payment issues" },
  { value: "spam", label: "Spam or fake activity" },
  { value: "conduct", label: "Unprofessional conduct" },
  { value: "other", label: "Other" },
];

export default function ReportUserModal({
  isOpen,
  onClose,
  subjectName,
  subjectRoleLabel = "user",
  context,
  onSubmit,
  isSubmitting,
  error: externalError,
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setReason("");
      setDescription("");
      setEvidenceUrl("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the issue.");
      return;
    }

    onSubmit({
      reason,
      description: description.trim(),
      evidenceUrl: evidenceUrl.trim() || undefined,
    });
  };

  const closeModal = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 relative">
        <button
          type="button"
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isSubmitting}
        >
          <IoClose size={24} />
        </button>

        <div className="space-y-1 mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Report {subjectRoleLabel}</h2>
          <p className="text-gray-500 text-sm">
            You are reporting <span className="font-semibold text-gray-700">{subjectName}</span>
            {context ? ` for "${context}"` : null}.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">
              Reason <span className="text-red-500">*</span>
            </span>
            <select
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            >
              <option value="">Select a reason</option>
              {reportReasons.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">
              Description <span className="text-red-500">*</span>
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              maxLength={700}
              placeholder="Explain what happened..."
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-y"
            />
            <span className="text-xs text-gray-400">
              {description.length}/700 characters
            </span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-700">
              Evidence URL (optional)
            </span>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(event) => setEvidenceUrl(event.target.value)}
              placeholder="Link to screenshots, documents, etc."
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </label>

          {(error || externalError) && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error || externalError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:opacity-90 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { reportReasons };

