import { FaDollarSign } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePerson } from "react-icons/md";

export default function ClientPostedJobsCards({
  items = [],
  onViewDetails,
  onApply,
}) {
  if (!items.length) {
    return <p className="text-gray-400 text-sm">No jobs found.</p>;
  }

  return (
    <>
      {items.map((item) => {
        const key = item._id ?? item.id ?? item.title;
        const client =
          item.client && typeof item.client === "object" ? item.client : {};
        const clientName = client.name ?? item.clientName ?? "Client";
        const clientCompletedJobs =
          client.completedJobs ??
          item.clientCompletedJobs ??
          item.clientCompletedJob ??
          0;
        const clientAvatar = client.avatarUrl ?? item.clientAvatarUrl;

        return (
          <div
            key={key}
            className="p-5 border border-gray-200 border-l-4 border-l-blue-500 rounded-2xl space-y-3 shadow-sm bg-white hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h1>
              <div className="px-2 py-0.5 bg-blue-400 font-semibold w-fit rounded-full text-white text-xs capitalize">
                {item.requiredSkill ?? item.occupation ?? "General"}
              </div>
            </div>
            <p className="text-gray-500 text-sm text-pretty">
              {item.description ?? item.body}
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FaDollarSign className="text-green-600" />
                  <span>৳{item.budget ?? "N/A"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaRegClock className="text-blue-500" />
                  <span>{item.duration ?? item.estimatedTime ?? "N/A"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <IoLocationOutline className="text-sky-500" />
                <span>{item.location ?? "Flexible"}</span>
              </div>
            </div>
            <hr className="text-gray-200" />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={clientAvatar || "/sampleProfile.png"}
                    alt={clientName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs uppercase tracking-wide text-gray-400">
                      Client
                    </span>
                    <h2 className="font-semibold text-gray-700">{clientName}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase tracking-wide text-gray-400">
                    Client success
                  </span>
                  <div className="flex items-center gap-1 justify-end text-gray-600 font-semibold">
                    <MdOutlinePerson size={20} />
                    <span>{clientCompletedJobs} completed</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-xs">
                {item.timePosted
                  ? item.timePosted
                  : item.createdAt
                  ? `Posted ${new Date(item.createdAt).toLocaleString()}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => onViewDetails?.(item)}
                className="flex-1 px-3 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-green-600 hover:text-white transition-all duration-200"
              >
                View Details
              </button>
              <button
                onClick={() => onApply?.(item)}
                className="flex-1 px-3 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:opacity-85 transition-all duration-200"
              >
                Apply Now
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
