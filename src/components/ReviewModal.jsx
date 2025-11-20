import { useState } from "react";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

export default function ReviewModal({ isOpen, onClose, job, onSubmit, isSubmitting, error: externalError }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!job?.id) {
      setError("Job information is missing");
      return;
    }

    onSubmit({
      jobId: job.id || job._id || job.jobId,
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <IoClose size={24} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">Write a Review</h2>
          <p className="text-gray-500 text-sm mt-1">
            Share your experience with {job?.userName || "the provider"}
          </p>
          {job?.title && (
            <p className="text-gray-600 font-semibold mt-2">{job.title}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  {(hoveredRating >= star || rating >= star) ? (
                    <FaStar
                      size={32}
                      className="text-amber-500 cursor-pointer transition-colors"
                    />
                  ) : (
                    <FaRegStar
                      size={32}
                      className="text-gray-300 cursor-pointer transition-colors hover:text-amber-300"
                    />
                  )}
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-gray-600 font-semibold">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this provider..."
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {(error || externalError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error || externalError}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

