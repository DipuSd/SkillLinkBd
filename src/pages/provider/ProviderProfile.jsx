import { FiUpload } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { IoRibbonOutline } from "react-icons/io5";
import { BsBagCheck } from "react-icons/bs";
import { MdOutlineEmail } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getProviderReviews } from "../../api/reviews";
import { uploadFile } from "../../api/upload";

const tabs = [
  { label: "Details", value: "details" },
  { label: "Skills", value: "skills" },
  { label: "Reviews", value: "reviews" },
];

import LocationPicker from "../../components/LocationPicker";

export default function ProviderProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [isSaving, setIsSaving] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    bio: "",
    skillsInput: "",
    hourlyRate: 0,
    experienceYears: 0,
    avatarUrl: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      location: user.location ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      skillsInput: user.skills?.join(", ") ?? "",
      hourlyRate: user.hourlyRate ?? 0,
      experienceYears: user.experienceYears ?? 0,
      avatarUrl: user.avatarUrl ?? "",
    });
  }, [user]);

  const reviewsQuery = useQuery({
    queryKey: ["provider-reviews", user?._id],
    queryFn: () => getProviderReviews(user?._id),
    enabled: Boolean(user?._id),
    staleTime: 60_000,
  });

  const reviews = reviewsQuery.data?.reviews ?? [];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("");

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        skills: form.skillsInput
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
        hourlyRate: Number(form.hourlyRate) || 0,
        experienceYears: Number(form.experienceYears) || 0,
        avatarUrl: form.avatarUrl,
      };

      if (locationData) {
        payload.location = locationData.locationName;
        payload.coordinates = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
      } else {
        payload.location = form.location;
      }

      await updateProfile(payload);
      setStatusMessage("Profile updated successfully.");
      setIsEditing(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ?? "Failed to update profile.";
      setStatusMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const metrics = useMemo(
    () => [
      {
        label: "Rating",
        value: user?.rating ?? 0,
        icon: <FaRegStar size={32} color="orange" />,
        description: "Average client rating",
      },
      {
        label: "Completed Jobs",
        value: user?.completedJobs ?? 0,
        icon: <IoRibbonOutline size={32} color="green" />,
        description: "Total jobs delivered",
      },
      {
        label: "Experience",
        value: `${user?.experienceYears ?? 0} yrs`,
        icon: <FaRegClock size={32} color="blue" />,
        description: "Professional experience",
      },
      {
        label: "Success Rate",
        value: `${Math.min((user?.completedJobs ?? 0) * 4, 100)}%`,
        icon: <BsBagCheck size={32} color="purple" />,
        description: "Based on completed jobs",
      },
    ],
    [user]
  );

  const skillList = useMemo(
    () => user?.skills ?? [],
    [user?.skills]
  );

  return (
    <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-10">
      <div className="flex flex-col lg:flex-row items-center lg:justify-between space-y-5 rounded-xl p-4 bg-gradient-to-r from-blue-400 to-emerald-500">
        <div className="flex flex-col lg:flex-row md:items-center md:space-y-4 lg:space-y-0 lg:space-x-5 w-full">
          <div className="relative w-fit mx-auto lg:mx-0">
            <div className="rounded-full border-4 border-white shadow-md overflow-hidden h-28 w-28">
              <img
                src={form.avatarUrl || "/sampleProfile.png"}
                alt="profile"
                className="h-full w-full object-cover"
              />
            </div>
            {isEditing ? (
              <label className="absolute top-20 -right-1 p-2 rounded-full bg-white cursor-pointer text-blue-500 font-semibold hover:bg-blue-500 hover:text-white shadow-md">
                <FiUpload size={18} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      setIsSaving(true);
                      const { url } = await uploadFile(file);
                      setForm((prev) => ({ ...prev, avatarUrl: url }));
                    } catch (error) {
                      console.error("Upload failed:", error);
                      setStatusMessage("Failed to upload image.");
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="hidden"
                />
              </label>
            ) : null}
          </div>
          <div className="flex flex-col items-center lg:items-start text-white space-y-2 w-full">
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm font-semibold">
              {skillList.slice(0, 2).map((skill) => (
                <span
                  key={skill}
                  className="px-2 rounded-full border border-white bg-white/20"
                >
                  {skill}
                </span>
              ))}
              {user?.location ? (
                <span className="flex items-center gap-1">
                  <IoLocationOutline size={18} />
                  {user.location}
                </span>
              ) : null}
            </div>
            {user?.bio ? (
              <p className="text-white/80 text-center lg:text-left">
                {user.bio}
              </p>
            ) : null}
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setStatusMessage("");
            }}
            className="rounded-lg bg-white py-2 px-4 flex items-center justify-center space-x-2 text-sm font-semibold text-blue-500 hover:opacity-80 cursor-pointer shadow-md"
          >
            <FaRegEdit size={18} />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-5 rounded-xl border border-gray-200 flex flex-col items-center space-y-2 bg-white"
          >
            {metric.icon}
            <h2 className="text-2xl font-semibold text-gray-800">
              {metric.value}
            </h2>
            <p className="text-gray-500 text-sm text-center">
              {metric.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-200 p-1 rounded-full flex items-center transition-all duration-200 space-x-3 font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 rounded-full px-2 py-1 cursor-pointer ${
              activeTab === tab.value ? "bg-white" : "text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "details" ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 p-5 space-y-5 bg-white"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Personal Information
            </h2>
            <p className="text-sm text-gray-500">
              Manage your personal details and contact information.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-700">Full Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="p-2 bg-gray-100 rounded-lg focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-70"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-700">Email</span>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full p-2 pl-10 bg-gray-100 rounded-lg text-gray-500"
                />
                <MdOutlineEmail className="absolute top-2 left-2 text-gray-400" size={22} />
              </div>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-700">Phone</span>
              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-2 pl-10 bg-gray-100 rounded-lg focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-70"
                />
                <FiPhone className="absolute top-2 left-2 text-gray-400" size={22} />
              </div>
            </label>
            <div className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-700">Location</span>
              {isEditing ? (
                <LocationPicker
                  onLocationSelect={(data) => {
                    setLocationData(data);
                    setForm((prev) => ({ ...prev, location: data.locationName }));
                  }}
                  initialLocation={
                    user?.coordinates
                      ? {
                          lat: user.coordinates.latitude,
                          lng: user.coordinates.longitude,
                        }
                      : null
                  }
                />
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    disabled
                    className="w-full p-2 pl-10 bg-gray-100 rounded-lg disabled:opacity-70"
                  />
                  <IoLocationOutline className="absolute top-2 left-2 text-gray-400" size={22} />
                </div>
              )}
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-700">Hourly Rate (৳)</span>
              <input
                type="number"
                name="hourlyRate"
                value={form.hourlyRate}
                onChange={handleChange}
                disabled={!isEditing}
                className="p-2 bg-gray-100 rounded-lg focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-70"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-lg font-semibold text-gray-700">Experience (years)</span>
              <input
                type="number"
                name="experienceYears"
                value={form.experienceYears}
                onChange={handleChange}
                disabled={!isEditing}
                className="p-2 bg-gray-100 rounded-lg focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-70"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-lg font-semibold text-gray-700">Bio</span>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              disabled={!isEditing}
              className="p-2 bg-gray-100 rounded-lg focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none disabled:opacity-70"
            />
          </label>
          {statusMessage ? (
            <p
              className={`text-sm font-semibold ${
                statusMessage.includes("Failed") ? "text-red-500" : "text-green-600"
              }`}
            >
              {statusMessage}
            </p>
          ) : null}
          {isEditing ? (
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setStatusMessage("");
                  setForm({
                    name: user?.name ?? "",
                    email: user?.email ?? "",
                    location: user?.location ?? "",
                    phone: user?.phone ?? "",
                    bio: user?.bio ?? "",
                    skillsInput: user?.skills?.join(", ") ?? "",
                    hourlyRate: user?.hourlyRate ?? 0,
                    experienceYears: user?.experienceYears ?? 0,
                    avatarUrl: user?.avatarUrl ?? "",
                  });
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          ) : null}
        </form>
      ) : null}

      {activeTab === "skills" ? (
        <div className="rounded-xl border border-gray-200 p-5 space-y-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
          <p className="text-gray-500 text-sm">
            Showcase the services you offer. Separate skills with commas when editing your profile.
          </p>
          <div className="flex flex-wrap gap-2">
            {skillList.length ? (
              skillList.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm">
                No skills added yet. Enable editing to add your skills.
              </p>
            )}
          </div>
          {isEditing ? (
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Update skills (comma separated)
              </span>
              <textarea
                name="skillsInput"
                value={form.skillsInput}
                onChange={handleChange}
                rows={3}
                className="p-2 bg-gray-100 rounded-lg focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {activeTab === "reviews" ? (
        <div className="rounded-xl border border-gray-200 p-5 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Client Reviews</h2>
            {reviewsQuery.isLoading ? (
              <span className="text-sm text-gray-400">Loading...</span>
            ) : null}
          </div>
          {reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No reviews yet. Complete jobs and ask clients to leave feedback.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border border-gray-200 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {review.client?.name ?? "Client"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {review.job?.title}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-amber-500 font-semibold">
                      <FaRegStar />
                      {review.rating}
                    </span>
                  </div>
                  {review.comment ? (
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  ) : null}
                  <p className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
