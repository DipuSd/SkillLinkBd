import { useQuery } from "@tanstack/react-query";
import { getJobs } from "../../api/jobs";

const statusColours = {
  open: "bg-emerald-100 text-emerald-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-purple-100 text-purple-700",
  cancelled: "bg-red-100 text-red-600",
};

function AdminJobs() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: () => getJobs({ includeClients: true }),
    staleTime: 30_000,
  });

  const jobs = data?.jobs ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Job Listings</h1>
        <p className="text-gray-500">
          Review all active and completed jobs posted on the platform.
        </p>
      </header>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-48 bg-white border border-gray-200 rounded-2xl animate-pulse"
              ></div>
            ))
          : jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {job.title}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {job.client?.name ?? "Unknown client"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      statusColours[job.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-3">
                  {job.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Budget: ৳{job.budget}</span>
                  <span>Duration: {job.duration}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{job.location}</span>
                  <span>
                    Posted{" "}
                    {job.createdAt
                      ? new Date(job.createdAt).toLocaleDateString()
                      : ""}
                  </span>
                </div>
              </div>
            ))}
      </div>
      {!isLoading && jobs.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No jobs found. Encourage clients to post new opportunities.
        </p>
      ) : null}
    </div>
  );
}

export default AdminJobs;

