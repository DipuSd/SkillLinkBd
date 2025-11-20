import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ApplicantCards from "../../components/ApplicantCards";
import { getApplications, updateApplicationStatus } from "../../api/applications";
import { getClientJobs } from "../../api/jobs";

function ClientApplicant() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const jobIdFromQuery = searchParams.get("jobId") ?? "";
  const [selectedJob, setSelectedJob] = useState(jobIdFromQuery);

  const { data: jobsResponse } = useQuery({
    queryKey: ["client-jobs", { status: "open" }],
    queryFn: () => getClientJobs({ status: "open" }),
    staleTime: 30_000,
  });

  // Only show non-completed jobs in the selector
  const jobs = useMemo(() => {
    const allJobs = jobsResponse?.jobs ?? [];
    return allJobs.filter((job) => job.status !== "completed");
  }, [jobsResponse]);

  const { data, isLoading } = useQuery({
    queryKey: ["client-applications", { jobId: selectedJob, status: "applied" }],
    queryFn: () =>
      getApplications({
        jobId: selectedJob || undefined,
        scope: "client",
        status: "applied",
      }),
    staleTime: 15_000,
  });

  // Filter out applications for completed jobs
  const applicants = useMemo(() => {
    const allApplications = data?.applications ?? [];
    return allApplications.filter(
      (application) => application.job?.status !== "completed"
    );
  }, [data]);

  const updateStatusMutation = useMutation({
    mutationFn: updateApplicationStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-applications"] });
      queryClient.invalidateQueries({ queryKey: ["client-dashboard"] });
    },
  });


  const handleJobChange = (event) => {
    const jobId = event.target.value;
    setSelectedJob(jobId);
    if (jobId) {
      searchParams.set("jobId", jobId);
    } else {
      searchParams.delete("jobId");
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleViewProfile = (application) => {
    if (application.provider?._id) {
      navigate(`/client/provider/${application.provider._id}`);
    }
  };

  const handleMessage = (application) => {
    navigate(`/client/chat?user=${application.provider?._id}`, {
      state: { jobId: application.job?._id },
    });
  };

  const handleHire = async (application) => {
    if (!application._id) {
      console.error("Application ID is missing");
      return;
    }

    if (!window.confirm(`Are you sure you want to hire ${application.provider?.name || "this provider"}?`)) {
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        applicationId: application._id,
        status: "hired",
      });
      // Show success message or notification
    } catch (error) {
      console.error("Error hiring applicant:", error);
      alert(error?.response?.data?.message || "Failed to hire applicant. Please try again.");
    }
  };

  return (
    <>
      <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5">
        {/* Title and active jobs selector */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Job Applicants</h1>
            <p className="text-gray-500">
              Review and manage applicants for your jobs.
            </p>
          </div>
          <select
            name="jobSelect"
            className="outline-none px-3 py-2 border border-gray-200 rounded-lg"
            value={selectedJob}
            onChange={handleJobChange}
          >
            <option value="">All Jobs</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
        {/* Applicants section */}
        <div className="space-y-5 mb-10">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-48 bg-white border border-gray-200 rounded-2xl animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <ApplicantCards
              applicants={applicants}
              onViewProfile={handleViewProfile}
              onMessage={handleMessage}
              onHire={handleHire}
              isHiring={updateStatusMutation.isPending}
            />
          )}
        </div>
      </div>
    </>
  );
}
export default ClientApplicant;
