import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "../../api/users";
import { getProviderReviews } from "../../api/reviews";
import { FaStar, FaRegStar } from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";

const tabs = [
  { label: "Details", value: "details" },
  { label: "Skills", value: "skills" },
  { label: "Reviews", value: "reviews" },
];

export default function ViewProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["provider-profile", providerId],
    queryFn: () => getUserById(providerId),
    enabled: !!providerId,
  });

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ["provider-reviews", providerId],
    queryFn: () => getProviderReviews(providerId),
    enabled: !!providerId && activeTab === "reviews",
  });

  const provider = userData?.user;
  const reviews = reviewsData?.reviews ?? [];

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">Provider not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const rating = provider.rating ?? 0;
  const totalRatings = provider.totalRatings ?? 0;

  return (
    <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <img
            src={provider.avatarUrl || "/sampleProfile.png"}
            alt={provider.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-400"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{provider.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {provider.location && (
                <div className="flex items-center gap-1 text-gray-600">
                  <IoLocationOutline />
                  <span>{provider.location}</span>
                </div>
              )}
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <FaStar className="text-amber-500" />
                  <span className="font-semibold">{rating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({totalRatings} reviews)</span>
                </div>
              )}
            </div>
            {provider.bio && (
              <p className="mt-3 text-gray-600">{provider.bio}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/client/chat?user=${provider._id}`)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <IoChatbubbleOutline />
              <span>Message</span>
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {provider.email && (
            <div className="flex items-center gap-2 text-gray-600">
              <MdOutlineEmail />
              <span>{provider.email}</span>
            </div>
          )}
          {provider.phone && (
            <div className="flex items-center gap-2 text-gray-600">
              <FiPhone />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.hourlyRate > 0 && (
            <div className="text-gray-600">
              <span className="font-semibold">Hourly Rate: </span>
              <span className="text-green-600 font-bold">৳{provider.hourlyRate}</span>
            </div>
          )}
          {provider.experienceYears > 0 && (
            <div className="text-gray-600">
              <span className="font-semibold">Experience: </span>
              <span>{provider.experienceYears} years</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === tab.value
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-600">
                {provider.bio || "No bio available."}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Statistics</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Completed Jobs</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {provider.completedJobs ?? 0}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Rating</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {rating > 0 ? rating.toFixed(1) : "N/A"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-500 text-sm">Experience</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {provider.experienceYears ?? 0} years
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Skills</h3>
            {provider.skills && provider.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No skills listed.</p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Client Reviews</h3>
            {reviewsLoading ? (
              <p className="text-gray-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-gray-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className="border border-gray-200 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {review.client?.name ?? "Client"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {review.job?.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? (
                              <FaStar className="text-amber-500" />
                            ) : (
                              <FaRegStar className="text-gray-300" />
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-600">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

