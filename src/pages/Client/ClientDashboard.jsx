import { FiPlusCircle } from "react-icons/fi";
import { BsBag } from "react-icons/bs";
import { IoPeopleOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { LuDollarSign } from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardMetricsCard from "../../components/DashboardMetricsCard";
import ProviderCards from "../../components/ProviderCards";
import ActivejobsCard from "../../components/ActiveJobsCard";
import { getClientDashboard } from "../../api/dashboard";
import { useAuth } from "../../context/AuthContext";
import WarningBanner from "../../components/WarningBanner";
import { markNotificationRead } from "../../api/notifications";

function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["client-dashboard"],
    queryFn: getClientDashboard,
    staleTime: 30_000,
  });

  const dismissWarningMutation = useMutation({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-dashboard"] });
    },
  });

  const handleDismissWarning = (warning) => {
    const notificationId = warning?._id ?? warning?.id;
    if (!notificationId) return;
    dismissWarningMutation.mutate(notificationId);
  };

  const metrics = [
    {
      label: "Active jobs",
      count: data?.metrics?.activeJobs ?? 0,
      icon: <BsBag size={24} color="blue" />,
    },
    {
      label: "Total Applicants",
      count: data?.metrics?.totalApplicants ?? 0,
      icon: <IoPeopleOutline size={24} color="teal" />,
    },
    {
      label: "Completed Jobs",
      count: data?.metrics?.completedJobs ?? 0,
      icon: <IoMdCheckmarkCircleOutline size={24} color="green" />,
    },
    {
      label: "Total Spent (BDT)",
      count: data?.metrics?.totalSpent ?? 0,
      icon: <LuDollarSign size={24} color="orange" />,
    },
  ];

  const providers = data?.recommendedProviders ?? [];
  const jobs = data?.activeJobs ?? [];

  return (
    <>
      <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5">
        {/* welcome banner section and post button */}
        <div className="w-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex flex-col md:flex-row md:items-center md:justify-between px-5 py-12 gap-4">
          <div className="text-white space-y-2">
            <h2 className="text-3xl font-semibold">
              Welcome, {user?.name ?? "Client"}
            </h2>
            <p className="font-semibold text-xl md:text-2xl">
              Ready to find the perfect worker for your next project?
            </p>
          </div>
          <button
            onClick={() => navigate("/client/jobs/new")}
            className="flex flex-row items-center justify-center gap-2 text-blue-500 bg-white rounded-xl px-5 py-3 cursor-pointer hover:opacity-90 font-semibold text-lg"
          >
            <FiPlusCircle size={18} />
            <span>Post a job</span>
          </button>
        </div>
        {/* warnings */}
        <WarningBanner
          warnings={data?.warnings}
          dismissible
          onDismiss={handleDismissWarning}
        />
        {/* statistics and metrics section section */}
        <DashboardMetricsCard items={metrics} loading={isLoading} />
        {/* Recommendations */}
        <div className="border-2 border-blue-200 rounded-xl p-4 bg-white space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* recommendation logo and text */}
            <div className="flex space-x-3">
              <div className="bg-[#07b1db] rounded-2xl p-4 text-white">
                <BsStars size={24} />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-800">
                  Top Providers Near You
                </h2>
                <p className="text-gray-500 text-sm md:text-base">
                  Suggested workers based on your needs
                </p>
              </div>
            </div>
            {/* view all button */}
            <button
              onClick={() => navigate("/client/providers")}
              className="border border-gray-300 rounded-lg hover:bg-green-500 hover:text-white py-2 px-4 cursor-pointer transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <span>View all</span>
              <FaArrowRight />
            </button>
          </div>
          {/* Providers card section */}
          <div className="my-5 flex flex-col lg:flex-row gap-3">
            <ProviderCards
              providers={providers}
              onHire={(provider) =>
                navigate(`/client/applicants?pref=${provider._id}`)
              }
              onContact={(provider) =>
                navigate(`/client/chat?user=${provider._id}`)
              }
              contactLabel="Message"
              hireLabel="Invite to Job"
            />
          </div>
        </div>
        {/* Active jobs section */}
        <div className="border border-gray-300 rounded-xl p-4 space-y-3 bg-white">
          <div className="flex flex-row items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg text-gray-800">
                Active Jobs
              </h2>
              <p className="text-gray-500 text-sm">
                Jobs currently accepting applications
              </p>
            </div>
            <button
              onClick={() => navigate("/client/applicants")}
              className="rounded-lg px-4 py-2 border border-gray-300 hover:bg-green-600 hover:text-white font-semibold cursor-pointer transition-all duration-200"
            >
              View Applications
            </button>
          </div>
          {/* active jobs section cards */}
          <ActivejobsCard
            jobs={jobs}
            onSelectApplicants={(job) =>
              navigate(`/client/applicants?jobId=${job._id}`)
            }
            applicantLabel="Review"
          />
        </div>
      </div>
    </>
  );
}
export default ClientDashboard;
