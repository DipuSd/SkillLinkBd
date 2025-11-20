export default function ProviderOnGoingJobs({ items = [] }) {
  if (!items.length) {
    return (
      <p className="text-gray-400 text-sm">
        No ongoing jobs right now. Apply to new jobs to get started.
      </p>
    );
  }

  return (
    <>
      {items.map((item) => (
        <div
          key={item._id ?? item.id ?? item.title}
          className="bg-gray-100 rounded-xl p-4 flex flex-row items-center justify-between border border-gray-200"
        >
          {/* title and info */}
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-gray-800">
              {item.title}
            </h1>
            <p className="text-gray-500 text-sm">
              {item.clientName ?? item.client?.name ?? "Client"}
            </p>
          </div>
          {/* status */}
          <div
            className={`px-3 py-1 rounded-full text-white text-xs font-semibold capitalize ${
              item.status === "In Progress"
                ? "bg-green-500"
                : item.status === "Starting Soon"
                ? "bg-blue-400"
                : "bg-teal-500"
            }`}
          >
            {item.status ?? "scheduled"}
          </div>
        </div>
      ))}
    </>
  );
}
