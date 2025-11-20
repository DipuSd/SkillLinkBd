import { MdOutlineFileDownload } from "react-icons/md";
import DashboardMetricsCard from "../../components/DashboardMetricsCard";
import { FaDollarSign } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { FaRegStar } from "react-icons/fa";
import { BsBagCheck } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getProviderEarnings } from "../../api/dashboard";

export default function ProviderEarnings() {
  const { data, isLoading } = useQuery({
    queryKey: ["provider-earnings"],
    queryFn: getProviderEarnings,
    staleTime: 60_000,
  });

  const metrics = data?.metrics ?? {};
  const chartData = data?.chart ?? [];
  const recentJobs = data?.recentJobs ?? [];

  const earningMetrics = [
    {
      label: "Total Earnings",
      count: metrics.totalEarnings ?? 0,
      icon: <FaDollarSign color="blue" size={24} />,
    },
    {
      label: "This Month",
      count: metrics.thisMonth ?? 0,
      icon: <FaArrowTrendUp color="green" size={24} />,
    },
    {
      label: "Avg. Rating",
      count: metrics.averageRating ?? 0,
      icon: <FaRegStar color="orange" size={24} />,
    },
    {
      label: "Jobs Completed",
      count: metrics.jobsCompleted ?? 0,
      icon: <BsBagCheck color="teal" size={24} />,
    },
  ];

  return (
    <>
      <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Earnings & Ratings</h1>
            <p className="text-sm text-gray-500">
              Track your income and performance.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold cursor-pointer hover:opacity-80 shadow-md"
            onClick={() => window.print()}
          >
            <MdOutlineFileDownload size={24} />
            <span>Export Report</span>
          </button>
        </div>

        <DashboardMetricsCard items={earningMetrics} loading={isLoading} />

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-300">
          <h2 className="text-gray-700 font-semibold text-lg">
            Earnings Overview
          </h2>
          <p className="text-sm text-sky-600 mb-4">
            Monthly earnings for the past 6 months
          </p>
          <div className="w-full h-72">
            {isLoading ? (
              <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl"></div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                No earning data yet. Complete jobs to see insights.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                  <Bar
                    dataKey="earnings"
                    radius={[8, 8, 0, 0]}
                    fill="url(#colorEarnings)"
                  />
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.9} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-300 mb-10">
          <h2 className="text-gray-700 font-semibold text-lg">Recent Jobs</h2>
          <p className="text-sm text-sky-600 mb-4">
            Payment history and client ratings
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 px-3 text-gray-600 font-medium">Job</th>
                  <th className="py-2 px-3 text-gray-600 font-medium">Client</th>
                  <th className="py-2 px-3 text-gray-600 font-medium">Date</th>
                  <th className="py-2 px-3 text-gray-600 font-medium">Payment</th>
                  <th className="py-2 px-3 text-gray-600 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">
                      No completed jobs yet.
                    </td>
                  </tr>
                ) : (
                  recentJobs.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2 px-3 text-gray-800">{item.job}</td>
                      <td className="py-2 px-3 text-gray-700">{item.client}</td>
                      <td className="py-2 px-3 text-gray-600">
                        {item.date
                          ? new Date(item.date).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="py-2 px-3">
                        <span className="bg-emerald-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                          ৳{item.payment?.toLocaleString?.() ?? item.payment ?? 0}
                        </span>
                      </td>
                      <td className="py-2 px-3 flex items-center gap-1 text-amber-500">
                        <FaStar className="text-amber-400" />
                        <span className="text-gray-700 font-medium">
                          {item.rating ?? "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
