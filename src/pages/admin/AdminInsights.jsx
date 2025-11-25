import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend, BarChart, Bar, LineChart, Line } from "recharts";
import { getAdminDashboard } from "../../api/dashboard";

const CHART_COLORS = ["#0ea5e9", "#14b8a6", "#f97316", "#a855f7"];

function ChartCard({ title, subtitle, isLoading, hasData, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {subtitle ? <p className="text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="h-72">
        {isLoading ? (
          <div className="h-full w-full rounded-xl bg-gray-100 animate-pulse" />
        ) : hasData ? (
          children
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            Not enough data yet.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: getAdminDashboard,
    staleTime: 60_000,
  });

  const charts = data?.charts ?? {};
  const insights = data?.insights ?? {};

  const roleDistribution = charts.roleDistribution ?? [];
  const jobStatus = charts.jobStatus ?? [];
  const userGrowth = charts.userGrowth ?? [];
  const reportVolume = charts.reportVolume ?? [];

  const insightCards = useMemo(
    () => [
      {
        label: "Avg. resolution time",
        value: insights.avgResolutionHours
          ? `${insights.avgResolutionHours} hrs`
          : "—",
      },
      {
        label: "Warnings (30d)",
        value: insights.warningsLast30Days ?? 0,
      },
      {
        label: "Suspensions",
        value: insights.suspensions ?? 0,
      },
      {
        label: "Bans",
        value: insights.bans ?? 0,
      },
    ],
    [insights]
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Platform Insights</h1>
        <p className="text-gray-500">
          Track growth, health metrics, and moderation trends at a glance.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-sm uppercase tracking-wide text-gray-500">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="User growth"
          subtitle="New registrations over the last six months"
          isLoading={isLoading}
          hasData={userGrowth.length > 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Job status mix"
          subtitle="Share of jobs by current status"
          isLoading={isLoading}
          hasData={jobStatus.some((item) => item.value > 0)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={jobStatus}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                dataKey="value"
                paddingAngle={2}
              >
                {jobStatus.map((_, index) => (
                  <Cell
                    // eslint-disable-next-line react/no-array-index-key
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Role distribution"
          subtitle="Active users by role"
          isLoading={isLoading}
          hasData={roleDistribution.some((item) => item.value > 0)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={roleDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Report volume"
          subtitle="Incoming reports over the last six months"
          isLoading={isLoading}
          hasData={reportVolume.some((item) => item.value > 0)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reportVolume}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}

export default AdminInsights;


