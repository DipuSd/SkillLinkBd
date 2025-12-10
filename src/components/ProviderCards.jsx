import { FaStar } from "react-icons/fa6";
import { IoBagCheckOutline } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { FiDollarSign } from "react-icons/fi";

const statusVariants = {
  available: "bg-green-600",
  busy: "bg-cyan-600",
  unavailable: "bg-red-600",
};

/**
 * ProviderCards Component
 * 
 * Displays a list of providers (for Clients to view).
 * Shows provider stats (rating, jobs, experience, rate) and actions (Contact, Hire).
 * 
 * @param {Object[]} providers - List of provider objects
 * @param {Function} onContact - Callback to contact provider
 * @param {Function} onHire - Callback to hire provider
 * @param {string} [contactLabel="Contact"] - Label for contact button
 * @param {string} [hireLabel="Hire Now"] - Label for hire button
 * @param {Object} [activeProviders={}] - Map of providerId to status string
 */
function ProviderCards({
  providers = [],
  onContact,
  onHire,
  contactLabel = "Contact",
  hireLabel = "Hire Now",
  activeProviders = {},
}) {
  if (!providers.length) {
    return (
      <p className="text-gray-400 text-sm">No providers to display yet.</p>
    );
  }

  return (
    <>
      {providers.map((provider) => {
        const key = provider._id ?? provider.id ?? provider.email;
        const status = provider.status?.toLowerCase() ?? "available";
        const rating =
          provider.rating ?? provider.averageRating ?? provider.score ?? "N/A";
        const completedJobs =
          provider.completedJobs ?? provider.completedJob ?? 0;
        const experience = provider.experience ?? 0;
        const hourlyRate = provider.hourlyRate ?? provider.paymentRate ?? 0;

        return (
          <div
            key={key}
            className="lg:flex-1 md:flex-none border border-gray-200 bg-white hover:shadow-lg transition-all duration-200 mt-2 rounded-2xl px-4 py-3"
          >
            <div className="flex justify-between gap-3">
              <div className="flex gap-3">
                <img
                  src={provider.avatarUrl || "/sampleProfile.png"}
                  alt={provider.name}
                  className="h-12 w-12 border-2 border-blue-500 rounded-full object-cover"
                />
                <div>
                  <h2 className="font-semibold text-gray-800">
                    {provider.name}
                  </h2>
                  <div className="w-fit text-white bg-cyan-500 rounded-full font-semibold px-2 py-0.5 text-xs capitalize">
                    {provider.primarySkill ??
                      provider.job ??
                      provider.skills?.[0] ??
                      "Provider"}
                  </div>
                </div>
              </div>
              <div
                className={`text-white text-xs font-semibold rounded-full px-3 py-1 h-fit capitalize ${
                  statusVariants[status] ?? "bg-green-600"
                }`}
              >
                {provider.status ?? "Available"}
              </div>
            </div>
            <div className="mt-3 ml-12 space-y-2">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex items-center gap-1 text-orange-400">
                  <FaStar size={16} />
                  <p>{rating}</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <IoBagCheckOutline size={16} />
                  <p>{completedJobs} jobs</p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <IoMdTime size={16} />
                  <p>{experience} yrs experience</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <IoLocationOutline size={16} />
                <p>{provider.location ?? "Not provided"}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <FiDollarSign size={16} className="text-green-600" />
                <p>
                  ৳{hourlyRate}
                  <span className="text-sm text-gray-400"> /hour</span>
                </p>
              </div>
            </div>
            <hr className="text-gray-200 my-3" />
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onContact?.(provider)}
                className="rounded-xl px-4 py-2 hover:bg-green-600 hover:text-white border border-gray-300 flex-1 cursor-pointer transition-all duration-200 font-semibold"
              >
                {contactLabel}
              </button>
              <button
                onClick={() => onHire?.(provider)}
                disabled={activeProviders?.[provider._id]}
                className={`rounded-xl px-4 py-2 flex-1 cursor-pointer transition-all duration-200 font-semibold ${
                  activeProviders?.[provider._id]
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-cyan-500 text-white hover:opacity-90"
                }`}
              >
                {activeProviders?.[provider._id]
                  ? activeProviders[provider._id] === "requested"
                    ? "Invited"
                    : "Active Job"
                  : hireLabel}
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
export default ProviderCards;
