import { FiUpload } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LocationPicker from "../../components/LocationPicker";
import { uploadFile } from "../../api/upload";

export default function ClientProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    bio: "",
    avatarUrl: "",
  });
  const [locationData, setLocationData] = useState(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name ?? "",
      email: user.email ?? "",
      location: user.location ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      avatarUrl: user.avatarUrl ?? "",
    });
    if (user.coordinates) {
      setLocationData({
        locationName: user.location,
        latitude: user.coordinates.latitude,
        longitude: user.coordinates.longitude,
      });
    }
  }, [user]);

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

  return (
    <div className="py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-10">
      <div className="flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-5 rounded-xl p-6 bg-gradient-to-r from-blue-400 to-emerald-500">
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-5 w-full">
          <div className="relative flex-shrink-0">
            <div className="rounded-full border-4 border-white shadow-md overflow-hidden h-28 w-28">
              <img
                src={form.avatarUrl || "/sampleProfile.png"}
                alt="profile"
                className="h-full w-full object-cover"
              />
            </div>
            {isEditing ? (
              <label className="absolute bottom-0 right-0 p-2 rounded-full bg-white cursor-pointer text-blue-500 font-semibold hover:bg-blue-500 hover:text-white shadow-md transition-colors">
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
          <div className="flex flex-col items-center lg:items-start text-white space-y-2 flex-1">
            <h1 className="text-2xl font-semibold">{user?.name}</h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm font-semibold">
              {user?.location ? (
                <span className="flex items-center gap-1">
                  <IoLocationOutline size={18} />
                  {user.location}
                </span>
              ) : null}
            </div>
            {user?.bio ? (
              <p className="text-white/90 text-center lg:text-left max-w-2xl">
                {user.bio}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsEditing((prev) => !prev);
              setStatusMessage("");
            }}
            className="rounded-lg bg-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-blue-500 hover:opacity-80 cursor-pointer shadow-md transition-opacity"
          >
            <FaRegEdit size={18} />
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>
      </div>

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
        </div>
        
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
    </div>
  );
}
