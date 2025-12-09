import { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { IoEyeOutline } from "react-icons/io5";
import { FiMessageSquare } from "react-icons/fi";
import { FaRegStar } from "react-icons/fa6";
import { LuStarOff } from "react-icons/lu";
import ReviewModal from "./ReviewModal";

/**
 * CompletedJobsCard Component
 * 
 * Displays completed or in-progress jobs with extensive actions:
 * - View details, Message, Report, Remove, Pay, Write Review.
 * 
 * @param {Object[]} jobs - List of job objects
 * @param {Function} onReviewSubmit - Callback when review is submitted
 * @param {Function} onReport - Callback to report a job/user
 * @param {Function} onDelete - Callback to delete/remove a job
 * @param {Function} onViewDetails - Callback to view details
 * @param {Function} onMessage - Callback to start messaging
 * @param {Function} onPay - Callback to initiate payment
 */
export default function CompletedJobsCard({ jobs, onReviewSubmit, onReport, onDelete, onViewDetails, onMessage, onPay }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  return (
    <>
      {jobs.map((job) => (
        <div
          key={job.id}
          className={`rounded-2xl hover:shadow-lg transition-all duration-200 p-6 space-y-4 h-fit ${
            job.reviewed == null || job.reviewed
              ? "border border-gray-200"
              : "border-2 border-green-300 "
          }`}
        >
          {/* review reminder - only show for completed jobs that haven't been reviewed */}
          {job.status === "Completed" && !job.reviewed ? (
            <div className="flex items-center bg-gradient-to-r from-green-200/30 to-blue-200/30 border border-green-200 p-2 text-green-500 rounded-xl space-x-2">
              <LuStarOff size={18} />
              <p>Review this job to help others find great providers!</p>
            </div>
          ) : null}
          {/* logo header and status section */}
          <div className="flex flex-row justify-between">
            {/* logo and header */}
            <div className="flex flex-row items-center space-x-4">
              {/* logo */}
              <div>
                <img
                  src={job.profilePic}
                  alt="profile picture"
                  className="relative bottom-2 w-12"
                />
              </div>
              {/* header section */}
              <div className="space-y-1">
                <h1 className="text-lg font-semibold">{job.title}</h1>
                <p className="text-gray-600">{job.userName}</p>
                <div className="flex flex-row items-center space-x-2">
                  {/* occupation */}
                  <div className="border border-gray-300 rounded-full px-2 font-semibold w-fit">
                    {job.occupation}
                  </div>
                  {/* incentive */}
                  <p className="text-sm text-gray-400">Budget: {job.budget}</p>
                </div>
              </div>
            </div>
            {/* job status */}
            <div
              className={` rounded-full px-2 font-semibold h-fit text-white ${
                job.status === "Completed"
                  ? job.paymentStatus === "paid"
                    ? "bg-blue-500" // Fully Paid & Completed
                    : "bg-orange-500" // Completed but Unpaid
                  : job.status === "In Progress"
                  ? "bg-green-500"
                  : "bg-red-400"
              }`}
            >
              {job.status === "Completed" && job.paymentStatus !== "paid"
                ? "Unpaid"
                : job.status === "Completed" && job.paymentStatus === "paid"
                ? "Paid"
                : job.status}
            </div>
          </div>
          <hr className="text-gray-300" />
          {/* posting completion and rating section and review comment */}
          <div className="space-y-2">
            <div className="flex flex-row items-center justify-between">
              {/* posting and completed section */}
              <div className="space-y-1">
                <p>Posted: {job.datePosted}</p>
                <p
                  className={`${
                    job.status === "Completed" ? "block" : "hidden"
                  }`}
                >
                  Completed: {job.dateCompleted}
                </p>
              </div>
              {/* rating section */}
              <div
                className={`flex items-center space-x-1 ${
                  job.reviewed ? "block" : "hidden"
                }`}
              >
                <FaStar size={20} color="orange" />
                <p className="text-md text-orange-400 font-semibold">
                  {job.rating}
                </p>
              </div>
            </div>
            {/* review comment */}
            <div
              className={`rounded-xl bg-gray-200 p-2 text-gray-500 ${
                job.reviewed ? "block" : "hidden"
              }`}
            >
              {job.reviewComment}
            </div>
          </div>
          {/* Buttons section */}
            <div className="flex flex-col sm:flex-row gap-2">
            {(job.status === "In Progress" || job.status === "Completed") && job.userName ? (
              <>
                <button
                  onClick={() => onViewDetails?.(job)}
                  className="flex-1 flex items-center justify-center p-1 border border-gray-300 hover:bg-green-500 hover:text-white font-semibold cursor-pointer rounded-xl space-x-2"
                >
                  <IoEyeOutline size={20} />
                  <p>View Details</p>
                </button>
                {job.status !== "Completed" ? (
                  <button
                    onClick={() => onMessage?.(job)}
                    className="flex-1 flex items-center justify-center p-1 border border-gray-300 hover:bg-green-500 hover:text-white font-semibold cursor-pointer rounded-xl space-x-2"
                  >
                    <FiMessageSquare size={20} className="relative top-[2px]" />
                    <p>Message</p>
                  </button>
                ) : null}
              </>
            ) : null}
            {job.rawStatus === "open" && onDelete ? (
              <button
                onClick={() => onDelete(job)}
                className="flex-1 flex items-center justify-center p-1 border border-red-200 text-red-500 hover:bg-red-500 hover:text-white font-semibold cursor-pointer rounded-xl space-x-2"
              >
                <p>Remove</p>
              </button>
            ) : null}
              {job.canReport && onReport ? (
                <button
                  onClick={() => onReport(job)}
                  className="flex-1 flex items-center justify-center p-1 border border-gray-300 hover:bg-red-500 hover:text-white font-semibold cursor-pointer rounded-xl space-x-2"
                >
                  <p>Report</p>
                </button>
              ) : null}
            {!job.reviewed && job.status === "Completed" ? (
              <button
                onClick={() => {
                  setSelectedJob(job);
                  setIsModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center p-1 border border-gray-300 bg-gradient-to-r from-green-500 to-blue-500 hover:opacity-80 text-white font-semibold cursor-pointer rounded-xl space-x-2"
              >
                <FaRegStar size={20} />
                <p>Write Review</p>
              </button>
            ) : null}
            
            {job.status === "Completed" && job.paymentStatus !== "paid" ? (
              <button
                onClick={() => onPay?.(job)}
                className="flex-1 flex items-center justify-center p-1 border border-green-600 bg-green-600 hover:bg-green-700 text-white font-semibold cursor-pointer rounded-xl space-x-2 shadow-md shadow-green-200"
              >
                <p>Pay Now</p>
              </button>
            ) : null}
          </div>
        </div>
      ))}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
          setSubmitError("");
        }}
        job={selectedJob}
        onSubmit={async (reviewData) => {
          if (onReviewSubmit) {
            setIsSubmitting(true);
            setSubmitError("");
            try {
              await onReviewSubmit(reviewData);
              setIsModalOpen(false);
              setSelectedJob(null);
              setSubmitError("");
            } catch (error) {
              console.error("Error submitting review:", error);
              const errorMessage = error?.response?.data?.message || "Failed to submit review. Please try again.";
              setSubmitError(errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          }
        }}
        isSubmitting={isSubmitting}
        error={submitError}
      />
    </>
  );
}
