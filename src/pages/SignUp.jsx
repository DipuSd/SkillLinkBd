import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { FaBoltLightning } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import LocationPicker from "../components/LocationPicker";

const skills = [
  "electrician",
  "plumber",
  "tutor",
  "carpenter",
  "tailor",
  "cleaner",
  "cook",
  "acRepairMan",
];

function SignUp() {
  const [agree, setAgree] = useState(false);
  const [role, setRole] = useState("client");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [locationData, setLocationData] = useState(null);
  const [providerForm, setProviderForm] = useState({
    primarySkill: "",
    additionalSkills: [],
    availability: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerUser,
    isAuthenticated,
    isBooting,
    user,
  } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleProviderFormChange = (e) => {
    const { name, value } = e.target;
    setProviderForm((s) => ({ ...s, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    setProviderForm((prev) => {
      const exists = prev.additionalSkills.includes(skill);
      return {
        ...prev,
        additionalSkills: exists
          ? prev.additionalSkills.filter((item) => item !== skill)
          : [...prev.additionalSkills, skill],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!agree) {
      setError("Please agree to the terms and conditions to continue.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.fullName,
        email: form.email,
        password: form.password,
        role,
      };

      // Add location data if provided
      if (locationData) {
        payload.location = locationData.locationName;
        payload.coordinates = {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        };
      }

      if (role === "provider") {
        payload.skills = [
          providerForm.primarySkill,
          ...providerForm.additionalSkills.filter(Boolean),
        ].filter(Boolean);
        payload.availability = providerForm.availability;
      }

      await registerUser(payload);
    } catch (registerError) {
      let message = "Unable to create account. Please try again.";
      
      if (registerError?.response?.data) {
        const errorData = registerError.response.data;
        
        // Handle validation errors with detailed messages
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const validationMessages = errorData.errors.map(
            (err) => `${err.param}: ${err.msg}`
          );
          message = validationMessages.join(". ");
        } else if (errorData.message) {
          message = errorData.message;
        }
      } else if (registerError?.message) {
        message = registerError.message;
      }
      
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isBooting && isAuthenticated) {
    const redirectTo =
      user?.role === "client"
        ? "/client/dashboard"
        : user?.role === "provider"
        ? "/provider/dashboard"
        : "/admin/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-10 px-5 py-10 bg-[#e1f3fa]">
        {/* image container*/}
        <div className="hidden lg:flex flex-col items-center justify-center transition-all duration-200">
          <img
            src="/createAccountStock.jpeg"
            alt="people looking at laptop"
            className="rounded-2xl max-w-2xl"
          />
          <div className="flex flex-col items-center mt-4 space-y-1 text-center">
            <h2 className="font-semibold text-2xl text-gray-800">
              Join Our Community
            </h2>
            <p className="font-medium text-gray-500">
              Start earning or hiring local talent in minutes.
            </p>
          </div>
        </div>
        {/* form container */}
        <div className="bg-white shadow-lg rounded-2xl py-10 px-6 md:px-8 border border-gray-100 w-full max-w-xl">
          {/* logo section */}
          <Link
            to="/"
            className="flex flex-row items-center space-x-2 cursor-pointer"
          >
            <div className="bg-teal-500 rounded-md p-1 text-orange-300">
              <FaBoltLightning size={24} />
            </div>
            <p className="font-bold text-xl text-teal-500">SkillMatch</p>
          </Link>
          <p className="text-gray-400 mt-1 text-lg font-semibold">
            Create your account to get started
          </p>
          {/* account type selector */}
          <div className="flex flex-row bg-gray-100 rounded-full justify-between px-2 py-1 mt-4 gap-2">
            {["provider", "client"].map((option) => (
              <button
                key={option}
                type="button"
                className={`font-semibold rounded-full px-4 py-1 flex-1 capitalize cursor-pointer transition-colors ${
                  role === option ? "bg-white shadow-sm" : ""
                }`}
                onClick={() => setRole(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {/* Account info form */}
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-700">
                  Full Name
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="bg-gray-100 rounded-lg px-3 py-2 text-gray-600 font-semibold focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-700">Email</span>
                <input
                  name="email"
                  value={form.email}
                  type="email"
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="bg-gray-100 rounded-lg px-3 py-2 text-gray-600 font-semibold focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </label>
              {/* password and confirm password section */}
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-gray-700">
                    Password
                  </span>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    className="bg-gray-100 rounded-lg px-3 py-2 text-gray-600 font-semibold focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-gray-700">
                    Confirm Password
                  </span>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                    className="bg-gray-100 rounded-lg px-3 py-2 text-gray-600 font-semibold focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                  />
                </label>
              </div>
              {/* provider specific info */}
              {role === "provider" ? (
                <div className="space-y-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-lg font-bold text-gray-700">
                      Primary Skill
                    </span>
                    <select
                      name="primarySkill"
                      value={providerForm.primarySkill}
                      onChange={handleProviderFormChange}
                      required
                      className="bg-gray-100 rounded-lg px-3 py-2 text-gray-700 focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                    >
                      <option value="">--Choose a skill--</option>
                      {skills.map((skill) => (
                        <option key={skill} value={skill}>
                          {skill}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Additional Skills (optional)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <button
                          type="button"
                          key={skill}
                          onClick={() => handleSkillToggle(skill)}
                          className={`px-3 py-1 rounded-full border text-sm capitalize ${
                            providerForm.additionalSkills.includes(skill)
                              ? "bg-blue-500 text-white border-blue-500"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <LocationPicker
                        value={locationData}
                        onChange={setLocationData}
                        required
                      />
                    </div>
                    <label className="flex flex-col gap-1">
                      <span className="text-lg font-bold text-gray-700">
                        Availability
                      </span>
                      <select
                        name="availability"
                        value={providerForm.availability}
                        onChange={handleProviderFormChange}
                        required
                        className="bg-gray-100 rounded-lg px-3 py-2 text-gray-700 focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                      >
                        <option value="">--Select--</option>
                        <option value="fullTime">Full-Time</option>
                        <option value="partTime">Part-Time</option>
                        <option value="weekendsOnly">Weekends Only</option>
                      </select>
                    </label>
                  </div>
                </div>
              ) : (
                <LocationPicker
                  value={locationData}
                  onChange={setLocationData}
                  required
                />
              )}
              <label className="flex items-center space-x-2 my-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(event) => setAgree(event.target.checked)}
                  className="w-5 h-5 outline-none"
                />
                <span className="text-sm font-semibold text-gray-500">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-500 hover:underline">
                    terms and conditions
                  </Link>
                </span>
              </label>
              {error ? (
                <p className="text-sm text-red-500 font-semibold">{error}</p>
              ) : null}
              {/* create account button */}
              <button
                type="submit"
                disabled={!agree || isSubmitting}
                className={`bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold w-full rounded-md py-2 my-2 transition-opacity ${
                  agree
                    ? "cursor-pointer hover:opacity-90"
                    : "cursor-not-allowed opacity-60"
                } disabled:opacity-60`}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
          <hr className="text-gray-300 my-4" />
          {/* already have an account section */}
          <div className="flex flex-row items-center justify-center gap-2">
            <p className="text-gray-400 text-sm ">
              Already have an account?
            </p>
            <Link to="/login" className="text-blue-500 hover:underline text-sm">
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUp;
