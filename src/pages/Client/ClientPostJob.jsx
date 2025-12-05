import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createJob } from "../../api/jobs";

const skillOptions = [
  { value: "electrician", label: "Electrician" },
  { value: "plumber", label: "Plumber" },
  { value: "tutor", label: "Tutor" },
  { value: "carpenter", label: "Carpenter" },
  { value: "tailor", label: "Tailor" },
  { value: "cleaner", label: "Cleaner" },
  { value: "cook", label: "Cook" },
  { value: "acRepairMan", label: "AC Repair Specialist" },
];

const durationOptions = [
  "1-2 hours",
  "2-4 hours",
  "1 day",
  "2-3 days",
  "1 week",
  "1 month",
];

function ClientPostJob() {
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    skillNeeded: "",
    budget: "",
    estimatedDuration: "",
    location: "",
  });
  const [error, setError] = useState("");

  const queryClient = useQueryClient();

  const { mutateAsync, isPending, isSuccess } = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["client-jobs"] });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const cleanForm = () => {
    setFormData({
      jobTitle: "",
      description: "",
      skillNeeded: "",
      budget: "",
      estimatedDuration: "",
      location: "",
    });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.jobTitle ||
      !formData.description ||
      !formData.skillNeeded ||
      !formData.budget
    ) {
      setError("Please fill in all required fields before posting.");
      return;
    }

    try {
      await mutateAsync({
        title: formData.jobTitle,
        description: formData.description,
        requiredSkill: formData.skillNeeded,
        budget: Number(formData.budget),
        duration: formData.estimatedDuration,
      });
      cleanForm();
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message ||
        "Failed to post job. Please try again.";
      setError(message);
    }
  };

  return (
    <>
      <div className="w-full h-full py-2 overflow-y-auto md:px-6 lg:px-20 mt-2 space-y-5 flex flex-col items-center">
        <div className="md:w-full lg:max-w-4xl space-y-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">Post a New Job</h1>
            <p className="text-gray-500">
              Find the perfect worker for your project.
            </p>
          </div>
          <div className="border border-gray-200 shadow-md rounded-xl px-5 py-6 space-y-5 bg-white">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Job Details
              </h2>
              <p className="text-gray-500">
                Provide information about the job you need.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-gray-700">Job Title</span>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g., Fix electrical wiring in kitchen"
                  required
                  className="rounded-md bg-blue-50 px-3 py-2 outline-none focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-semibold text-gray-700">Description</span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the job in detail"
                  rows={5}
                  required
                  className="rounded-md bg-blue-50 px-3 py-2 outline-none focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 resize-y placeholder-gray-400"
                />
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-700">
                    Skill Needed
                  </span>
                  <select
                    name="skillNeeded"
                    value={formData.skillNeeded}
                    onChange={handleChange}
                    required
                    className="bg-blue-50 rounded-lg px-3 py-2 text-gray-700 focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                  >
                    <option value="">--Choose a skill--</option>
                    {skillOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-700">
                    Budget (BDT)
                  </span>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    min={0}
                    placeholder="e.g., 3500"
                    required
                    className="rounded-md bg-blue-50 px-3 py-2 outline-none focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 placeholder-gray-400"
                  />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-700">
                    Estimated Duration
                  </span>
                  <select
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    className="bg-blue-50 rounded-lg px-3 py-2 text-gray-700 focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                  >
                    <option value="">--Select duration--</option>
                    {durationOptions.map((duration) => (
                      <option key={duration} value={duration}>
                        {duration}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {error ? (
                <p className="text-sm text-red-500 font-semibold">{error}</p>
              ) : null}
              {isSuccess ? (
                <p className="text-sm text-green-600 font-semibold">
                  Job posted successfully!
                </p>
              ) : null}
              <hr className="text-gray-200" />
              <div className="flex flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={cleanForm}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold border border-gray-200 hover:bg-green-600 hover:text-white cursor-pointer transition-all duration-200"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 px-4 py-2 rounded-lg font-semibold bg-blue-500 text-white cursor-pointer hover:opacity-90 transition-all duration-200 disabled:opacity-60"
                >
                  {isPending ? "Posting..." : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
export default ClientPostJob;
