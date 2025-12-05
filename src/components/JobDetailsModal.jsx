import { IoClose } from "react-icons/io5";
import { FaDollarSign, FaRegClock } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";

export default function JobDetailsModal({ isOpen, onClose, job }) {
  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Job Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full">
                <FaDollarSign />
                <span className="font-semibold">{job.budget}</span>
              </div>
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                <FaRegClock />
                <span>{job.duration || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                <IoLocationOutline />
                <span>{job.location || "Flexible"}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Description</h4>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {job.description || "No description provided."}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-700">Status</h4>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                  job.rawStatus === "completed"
                    ? "bg-blue-100 text-blue-700"
                    : job.rawStatus === "in-progress"
                    ? "bg-green-100 text-green-700"
                    : job.rawStatus === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {job.status}
              </span>
              {job.datePosted && (
                <span className="text-sm text-gray-500">
                  Posted on {job.datePosted}
                </span>
              )}
            </div>
          </div>

          {job.userName && (
            <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-4">
              <img
                src={job.profilePic || "/sampleProfile.png"}
                alt={job.userName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">
                  Hired Provider
                </p>
                <p className="font-bold text-gray-800">{job.userName}</p>
                <p className="text-sm text-gray-600">{job.occupation}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
