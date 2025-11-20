function DashboardMetricsCard({ items = [], loading = false }) {
  const skeletons = Array.from({ length: Math.max(items.length, 4) });

  return (
    <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4">
      {loading
        ? skeletons.map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-32 rounded-xl border border-gray-200 bg-gray-100 animate-pulse"
            ></div>
          ))
        : items.map((item, index) => (
            <div
              key={item.label ?? index}
              className="flex flex-row items-center justify-between hover:shadow-lg rounded-xl border border-gray-200 py-4 px-6 border-t-4 border-t-blue-400 bg-white transition-all duration-200"
            >
              <div>
                <h2 className="text-gray-400 text-sm uppercase tracking-wide">
                  {item.label}
                </h2>
                <p className="text-3xl font-bold text-gray-800">
                  {item.count ?? 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3 text-blue-500">
                {item.icon ?? null}
              </div>
            </div>
          ))}
    </div>
  );
}
export default DashboardMetricsCard;
