import { FaStar } from "react-icons/fa6";
import { FaRegEye } from "react-icons/fa";
import { IoChatbubbleOutline } from "react-icons/io5";
import { BsPersonCheck } from "react-icons/bs";

const statusStyles = {
  applied: "bg-orange-400",
  pending: "bg-orange-400",
  shortlisted: "bg-blue-500",
  hired: "bg-green-600",
  rejected: "bg-red-500",
  completed: "bg-green-700",
  withdrawn: "bg-gray-500",
};

/**
 * ApplicantCards Component
 * 
 * Displays a list of job applicants (or applications for a provider).
 * Used by Clients to view applicants and Providers to view their own applications.
 * 
 * @param {Object[]} applicants - List of application objects
 * @param {Function} onViewProfile - Callback to view applicant profile
 * @param {Function} onMessage - Callback to message applicant
 * @param {Function} onHire - Callback to hire applicant
 * @param {Function} onReject - Callback to reject applicant
 * @param {boolean} [isHiring=false] - Loading state during hiring process
 */
function ApplicantCards({
  applicants = [],
  onViewProfile,
  onMessage,
  onHire,
  onReject,
  isHiring = false,
}) {
  if (!applicants.length) {
    return (
      <p className="text-gray-400 text-sm">
        No applications yet. Share your job to attract more providers.
      </p>
    );
  }

  return (
    <>
      {applicants.map((application) => {
        const key = application._id ?? application.id;
        const provider = application.provider ?? {};
        const job = application.job ?? {};
        const status = (application.status ?? "pending").toLowerCase();
        const appliedAt = application.appliedAt ?? application.createdAt;
        const rating =
          provider.rating ?? provider.averageRating ?? application.rating;
        const completedJobs =
          provider.completedJobs ?? application.completedJobs ?? 0;
        const experienceYears =
          provider.experienceYears ?? application.experienceInYear ?? 0;
        const proposal =
          application.message ??
          application.coverLetter ??
          application.introStatement ??
          "No introduction provided.";

        return (
          <div
            key={key}
            className="w-full p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-md space-y-4 transition-all duration-200"
          >
            {/* title and status section */}
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-800">
                {job.title ?? "Job Application"}
              </h2>
              <div
                className={`rounded-full px-3 py-0.5 text-white text-xs font-semibold capitalize ${
                  statusStyles[status] ?? statusStyles.pending
                }`}
              >
                {status}
              </div>
            </div>
            {/* profile section */}
            <div className="flex items-center gap-3">
              <img
                src={provider.avatarUrl || "/sampleProfile.png"}
                alt={provider.name}
                className="w-14 h-14 object-cover border-2 border-blue-400 rounded-full"
              />
              <div className="space-y-1">
                <h2 className="text-md font-semibold text-gray-800">
                  {provider.name ?? "Unknown Provider"}
                </h2>
                <div className="w-fit text-white rounded-full bg-blue-400 px-3 py-0.5 font-semibold text-xs capitalize">
                  {provider.primarySkill ?? provider.skills?.[0] ?? "Provider"}
                </div>
              </div>
            </div>
            {/* details */}
            <div className="space-y-4 ml-12">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-orange-400">
                  <FaStar size={16} />
                  <p>{rating ?? "N/A"}</p>
                </div>
                <span className="text-gray-500">
                  {completedJobs} jobs completed
                </span>
                <span className="text-gray-500">
                  {experienceYears} years experience
                </span>
              </div>
              <div className="bg-gray-100 rounded-xl p-3 text-sm text-gray-600">
                {proposal}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-500">
                <span>
                  Applied:{" "}
                  {appliedAt
                    ? new Date(appliedAt).toLocaleString()
                    : "Unknown"}
                </span>
                <div className="flex items-center gap-2">
                  <span>Proposed Budget:</span>
                  <div className="rounded-full bg-green-600 text-white font-semibold px-3 py-1">
                    ৳{application.proposedBudget ?? "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <hr className="text-gray-200" />
            {/* actions */}
            <div className="flex flex-col md:flex-row items-center gap-2">
              <button
                onClick={() => onViewProfile?.(application)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 hover:bg-green-600 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-semibold text-sm"
              >
                <FaRegEye size={16} />
                <span>View Profile</span>
              </button>
              {status !== "completed" && job.status !== "completed" ? (
                <button
                  onClick={() => onMessage?.(application)}
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 hover:bg-green-600 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 font-semibold text-sm"
                >
                  <IoChatbubbleOutline size={16} />
                  <span>Chat</span>
                </button>
              ) : null}
              {(status === "pending" || status === "applied") && job.status === "open" ? (
                <>
                  <button
                    onClick={() => onHire?.(application)}
                    disabled={isHiring}
                    className="flex-1 px-3 py-2 rounded-xl bg-blue-500 text-white cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <BsPersonCheck size={16} />
                    <span>{isHiring ? "Hiring..." : "Hire"}</span>
                  </button>
                  <button
                    onClick={() => onReject?.(application)}
                    disabled={isHiring}
                    className="flex-1 px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Reject</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ApplicantCards;
