import { BsPeople } from "react-icons/bs";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

function ActivejobsCard({
  jobs = [],
  onSelectApplicants,
  applicantLabel = "View Applicants",
}) {
  if (!jobs.length) {
    return (
      <p className="text-gray-400 text-sm">
        You have no active jobs at the moment. Post a job to get started.
      </p>
    );
  }

  return (
    <>
      {jobs.map((job) => {
        const key = job._id ?? job.id ?? job.title;
        const status = job.status ?? "open";
        const postedAt = job.posted ?? job.createdAt;
        const applicantCount = job.applicantCount ?? job.applications ?? 0;

        return (
          <div
            key={key}
            className={`px-4 py-3 rounded-lg space-y-2 border ${
              status === "open"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <div className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                {job.title}
              </h2>
              <div
                className={`rounded-full px-3 py-0.5 text-xs font-semibold border capitalize ${
                  status === "open"
                    ? "bg-green-500 text-white border-transparent"
                    : "text-gray-600 border-gray-200"
                }`}
              >
                {status}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <p>Budget: ৳{job.budget}</p>
              <span>•</span>
              <p>
                Posted:{" "}
                {postedAt ? new Date(postedAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div
              className={`flex items-center gap-2 ${
                status === "open" ? "text-blue-500" : "text-green-500"
              }`}
            >
              {status === "open" ? (
                <>
                  <BsPeople size={16} />
                  <p>{applicantCount} applicants</p>
                  {onSelectApplicants ? (
                    <button
                      onClick={() => onSelectApplicants(job)}
                      className="text-sm font-semibold text-blue-600 underline hover:text-blue-700"
                    >
                      {applicantLabel}
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <IoMdCheckmarkCircleOutline size={16} />
                  <p>Worker assigned</p>
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ActivejobsCard;
