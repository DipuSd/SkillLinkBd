import DashboardMetricsCard from "../../components/DashboardMetricsCard";
import ClientPostedJobsCards from "../../components/ClientPostedJobsCards";
import ProviderOnGoingJobs from "../../components/ProviderOnGoingJobs";
import ProviderRecentNotification from "../../components/ProviderRecentNotification";
import { BsBag } from "react-icons/bs";
import { FaRegStar } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { BsStars } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProviderDashboard } from "../../api/dashboard";
import { getRecommendedJobs } from "../../api/jobs";
import { applyToJob } from "../../api/applications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import WarningBanner from "../../components/WarningBanner";
import { markNotificationRead } from "../../api/notifications";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["provider-dashboard"],
    queryFn: getProviderDashboard,
    staleTime: 30_000,
  });

  const { data: recommendedJobsData, isLoading: isJobsLoading } = useQuery({
    queryKey: ["provider-recommended-jobs"],
    queryFn: () => getRecommendedJobs(),
    staleTime: 15_000,
  });

  const applyMutation = useMutation({
    mutationFn: applyToJob,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["provider-recommended-jobs"],
      });
      queryClient.invalidateQueries({ queryKey: ["provider-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["provider-applications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const dismissWarningMutation = useMutation({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-dashboard"] });
    },
  });

  const handleDismissWarning = (warning) => {
    const notificationId = warning?._id ?? warning?.id;
    if (!notificationId) return;
    dismissWarningMutation.mutate(notificationId);
  };

  const dashMetrics = [
    {
      label: "Active Applications",
      count: data?.metrics?.activeApplications ?? 0,
      icon: <BsBag color="blue" size={24} />,
    },
    {
      label: "Completed Jobs",
      count: data?.metrics?.completedJobs ?? 0,
      icon: <FaRegStar color="green" size={24} />,
    },
    {
      label: "Total Earnings (BDT)",
      count: data?.metrics?.totalEarnings ?? 0,
      icon: <FaDollarSign color="teal" size={24} />,
    },
    {
      label: "Average Rating",
      count: data?.metrics?.averageRating?.toFixed(1) ?? "N/A",
      icon: <FaArrowTrendUp color="orange" size={24} />,
    },
  ];

  const recommendedJobs = recommendedJobsData?.jobs ?? [];
  const ongoingJobs = data?.ongoingJobs ?? [];
  const recentNotifications = data?.recentNotifications ?? [];

  return (
    <>
      <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5">
        {/* welcome banner */}
        <div className="w-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between px-5 py-12 gap-4">
          <div className="text-white space-y-2">
            <h2 className="text-3xl font-semibold">
              {data?.welcomeMessage ?? "Welcome back!"}
            </h2>
            <p className="font-semibold text-xl md:text-2xl">
              {data?.subheading ??
                "You have new job recommendations based on your skills."}
            </p>
          </div>
          <button
            onClick={() => navigate("/provider/jobs")}
            className="flex items-center gap-3 text-blue-500 bg-white rounded-xl px-5 py-3 cursor-pointer hover:opacity-90 font-semibold text-lg"
          >
            <span>Browse Jobs</span>
            <FaArrowRight size={16} />
          </button>
        </div>
        {/* warnings */}
        <WarningBanner
          warnings={data?.warnings}
          dismissible
          onDismiss={handleDismissWarning}
        />
        {/* dashboard metrics section */}
        <div>
          <DashboardMetricsCard items={dashMetrics} loading={isLoading} />
        </div>
        {/* Recommended jobs section */}
        <div className="px-4 py-4 rounded-2xl border-2 border-blue-200 space-y-5 bg-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex space-x-3 items-center">
              <div className="p-3 rounded-xl text-white bg-gradient-to-r from-blue-400 to-blue-300">
                <BsStars size={24} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Job Recommendations
                </h1>
                <p className="text-gray-500 text-sm md:text-base">
                  Jobs matched to your skills and location.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/provider/jobs")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 cursor-pointer hover:bg-green-500 hover:text-white font-semibold transition-colors"
            >
              <span>View All</span>
              <FaArrowRight />
            </button>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-5">
            {isJobsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-60 bg-white border border-gray-200 rounded-2xl animate-pulse"
                ></div>
              ))
            ) : (
              <ClientPostedJobsCards
                items={recommendedJobs}
                onApply={(job) =>
                  applyMutation.mutate({
                    jobId: job._id,
                    proposedBudget: job.budget,
                  })
                }
                onViewDetails={(job) =>
                  navigate(`/provider/jobs?jobId=${job._id}`)
                }
              />
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-5 pb-10">
          {/* ongoing jobs section */}
          <div className="p-4 rounded-2xl border border-gray-200 space-y-5 bg-white">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Ongoing Jobs
              </h1>
              <p className="text-gray-500 text-sm">
                Jobs you're currently working on.
              </p>
            </div>
            <div className="space-y-5">
              <ProviderOnGoingJobs items={ongoingJobs} />
            </div>
          </div>
          {/* recent notification section */}
          <div className="p-4 rounded-2xl border border-gray-200 space-y-5 bg-white">
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                Recent Notifications
              </h1>
              <p className="text-gray-500 text-sm">
                Stay updated with your activities.
              </p>
            </div>
            <div className="space-y-4">
              <ProviderRecentNotification items={recentNotifications} />
              <div>
                <button
                  onClick={() => navigate("/provider/notifications")}
                  className="w-full rounded-lg font-semibold hover:bg-green-500 hover:text-white border border-gray-300 px-3 py-2 cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>View All Notifications</span>
                  <FaArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
