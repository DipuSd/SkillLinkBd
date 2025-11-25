import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../../api/dashboard";
import DashboardMetricsCard from "../../components/DashboardMetricsCard";
import NotificationCards from "../../components/NotificationCards";

const defaultMetrics = [
  { label: "Total Users", count: 0 },
  { label: "Active Jobs", count: 0 },
  { label: "Pending Reports", count: 0 },
  { label: "Revenue (BDT)", count: 0 },
];

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 60_000,
  });

  const metrics = data?.metrics
    ? [
        {
          label: "Total Users",
          count: data.metrics.totalUsers ?? 0,
        },
        {
          label: "Active Jobs",
          count: data.metrics.activeJobs ?? 0,
        },
        {
          label: "Pending Reports",
          count: data.metrics.pendingReports ?? 0,
        },
        {
          label: "Revenue (BDT)",
          count: data.metrics.revenue ?? 0,
        },
      ]
    : defaultMetrics;

  const insightCards = [
    {
      label: "Avg. Resolution (hrs)",
      value: data?.insights?.avgResolutionHours
        ? data.insights.avgResolutionHours
        : "—",
    },
    {
      label: "Warnings (30d)",
      value: data?.insights?.warningsLast30Days ?? 0,
    },
    {
      label: "Suspensions",
      value: data?.insights?.suspensions ?? 0,
    },
    {
      label: "Bans",
      value: data?.insights?.bans ?? 0,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Platform Overview</h1>
        <p className="text-gray-500">
          Monitor user activity, reports, and platform performance.
        </p>
      </header>

      <section>
        <DashboardMetricsCard items={metrics} loading={isLoading} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className="text-2xl font-semibold text-gray-800 mt-2">
              {isLoading ? (
                <span className="inline-block h-6 w-16 bg-gray-100 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </p>
          </div>
        ))}
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Pending Reports</h2>
              <p className="text-gray-400">
                Resolve issues to maintain community trust.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <NotificationCards
              items={
                data?.pendingReports?.map((report) => ({
                  id: report._id,
                  title: report.reasonLabel,
                  body: report.description,
                  timeStamp: report.createdAt,
                  isRead: false,
                  type: "info",
                })) ?? []
              }
              emptyMessage="All caught up! No reports awaiting action."
              showActions={false}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Top Providers</h2>
              <p className="text-gray-400">
                High-performing providers with excellent ratings.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {(data?.topProviders ?? []).map((provider) => (
              <div
                key={provider._id}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={provider.avatarUrl || "/sampleProfile.png"}
                    alt={provider.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {provider.primarySkill}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    ⭐ {provider.rating?.toFixed(1) ?? "N/A"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {provider.completedJobs ?? 0} jobs
                  </p>
                </div>
              </div>
            ))}
            {data?.topProviders?.length === 0 && (
              <p className="text-gray-400 text-sm">
                No provider data available yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;

