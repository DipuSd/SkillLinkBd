import { TbFilterSearch } from "react-icons/tb";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ClientPostedJobsCards from "../../components/ClientPostedJobsCards";
import { getJobs, getRecommendedJobs } from "../../api/jobs";
import { applyToJob } from "../../api/applications";

const categories = [
  { label: "All Categories", value: "" },
  { label: "Electrician", value: "electrician" },
  { label: "Tutor", value: "tutor" },
  { label: "Plumber", value: "plumber" },
  { label: "Designer", value: "designer" },
  { label: "Carpenter", value: "carpenter" },
  { label: "Tailor", value: "tailor" },
];

export default function ProviderJobs() {
  const [filters, setFilters] = useState({
    search: "",
    skill: "",
    minBudget: 0,
  });
  const [selectedJob, setSelectedJob] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["provider-jobs", filters],
    queryFn: () =>
      getJobs({
        search: filters.search || undefined,
        requiredSkill: filters.skill || undefined,
        minBudget: filters.minBudget || undefined,
        status: "open",
        includeClients: true,
      }),
    staleTime: 15_000,
  });

  const { data: recommendedData } = useQuery({
    queryKey: ["provider-recommended-jobs-list"],
    queryFn: getRecommendedJobs,
    staleTime: 30_000,
  });

  const applyMutation = useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
      queryClient.invalidateQueries({
        queryKey: ["provider-recommended-jobs-list"],
      });
      queryClient.invalidateQueries({ queryKey: ["provider-recommended-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["provider-applications"] });
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      alert("Application submitted successfully!");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Failed to apply to job.";
      alert(message);
    },
  });

  const jobs = data?.jobs ?? [];
  const recommendedJobs = recommendedData?.jobs ?? [];

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      skill: "",
      minBudget: 0,
    });
  };

  const handleApply = (job) =>
    applyMutation.mutate({
      jobId: job._id,
      proposedBudget: job.budget,
    });

  const handleViewDetails = (job) => setSelectedJob(job);

  const closeDetails = () => setSelectedJob(null);

  return (
    <>
      <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-10">
        <div>
          <h1 className="text-2xl font-semibold">Browse Jobs</h1>
          <p className="text-gray-500">
            Find local opportunities that match your skills.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-gray-200 space-y-3 shadow-sm bg-white">
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <TbFilterSearch size={24} />
            <span className="text-lg">Filters</span>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="lg:flex-1 text-gray-500 w-full">
              <div className="relative">
                <FaSearch className="absolute top-3 left-3 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search jobs..."
                  className="pl-10 py-2 rounded-lg bg-gray-100 focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none placeholder-gray-500 w-full"
                />
              </div>
            </div>
            <div className="lg:flex-1 w-full">
              <select
                name="skill"
                value={filters.skill}
                onChange={handleFilterChange}
                className="py-2 rounded-lg bg-gray-100 w-full outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:flex-1 w-full flex items-center gap-2">
              <label className="text-gray-600 text-sm">Budget: ৳</label>
              <input
                type="number"
                name="minBudget"
                value={filters.minBudget}
                onChange={handleFilterChange}
                min={0}
                step={500}
                className="w-full rounded-lg bg-gray-100 px-3 py-2 outline-none focus:border focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <button
              onClick={handleReset}
              className="lg:flex-1 w-full py-2 rounded-lg border border-gray-300 hover:bg-green-500 hover:text-white font-semibold transition-all duration-200 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
          <div className="flex items-center mt-2 gap-2 text-sm text-gray-500">
            <span>Recommended minimum budget</span>
            <div className="bg-teal-500 rounded-full text-white px-2 font-semibold">
              ৳{filters.minBudget}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Suggested for you
          </h2>
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5">
            <ClientPostedJobsCards
              items={recommendedJobs}
              onApply={handleApply}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>

        <div className="space-y-4 pb-10">
          <h2 className="text-lg font-semibold text-gray-700">
            All Open Jobs
          </h2>
          {isLoading ? (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-60 bg-white border border-gray-200 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5">
              <ClientPostedJobsCards
                items={jobs}
                onApply={handleApply}
                onViewDetails={handleViewDetails}
              />
            </div>
          )}
        </div>
      </div>
      <JobDetailsModal job={selectedJob} onClose={closeDetails} />
    </>
  );
}

function JobDetailsModal({ job, onClose }) {
  if (!job) return null;

  const client =
    job.client && typeof job.client === "object" ? job.client : undefined;

  const details = [
    { label: "Budget", value: job.budget ? `৳${job.budget}` : "Not set" },
    { label: "Duration", value: job.duration || "Not specified" },
    { label: "Location", value: job.location || client?.location || "Flexible" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Client
            </p>
            <h2 className="text-xl font-semibold text-gray-800">
              {client?.name ?? "Client"}
            </h2>
            <p className="text-sm text-gray-500">
              {client?.location ?? job.location ?? "Location not provided"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-gray-500 hover:text-gray-800"
          >
            Close
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Job Title
            </p>
            <p className="text-lg font-semibold text-gray-900">{job.title}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">
              Description
            </p>
            <p className="text-gray-600 whitespace-pre-wrap">
              {job.description ?? "No description provided."}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 text-gray-600">
          {details.map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3"
            >
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {item.label}
              </p>
              <p className="font-semibold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Posted{" "}
            {job.createdAt
              ? new Date(job.createdAt).toLocaleDateString()
              : "recently"}
          </span>
          {job.requiredSkill ? (
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs uppercase tracking-wide">
              {job.requiredSkill}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
