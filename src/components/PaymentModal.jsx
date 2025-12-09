import { useState } from "react";
import { IoClose, IoShieldCheckmark } from "react-icons/io5";
import { FaLock, FaMobileAlt } from "react-icons/fa";

/**
 * PaymentModal Component
 * 
 * A modal that simulates a payment process (specifically bKash).
 * It collects the user's mobile number and PIN to authorize a payment for a job.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {Function} props.onClose - Callback to close the modal.
 * @param {Object} props.job - The job object containing payment details (e.g., budget, title).
 * @param {Function} props.onPay - Callback function executed when payment is confirmed. Receives the job object.
 * @param {boolean} props.isProcessing - Loading state during payment processing.
 */
export default function PaymentModal({ isOpen, onClose, job, onPay, isProcessing }) {
  // State for the bKash account number input
  const [bkashNumber, setBkashNumber] = useState("");
  // State for the PIN input
  const [pin, setPin] = useState("");

  // Early return if modal is closed or job details are missing
  if (!isOpen || !job) return null;

  /**
   * Handles the form submission for payment.
   * Calls the onPay prop with the current job details.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onPay(job);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Modal Content Wrapper with animation */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Section: Title and Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#E2136E] text-white">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">bKash Payment</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            disabled={isProcessing}
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Main Content Area: Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center space-y-1">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-2">
               <img src="https://logos-download.com/wp-content/uploads/2022/01/BKash_Logo_icon.png" alt="bKash" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display='none'} />
               <FaMobileAlt className="text-[#E2136E] text-2xl" style={{display: 'none'}} /> 
            </div>
            <p className="text-gray-500 text-sm uppercase tracking-wide">
              Merchant: SkillLinkBd
            </p>
            <p className="text-4xl font-bold text-gray-900">৳{job.budget}</p>
            <p className="text-sm text-gray-500">for {job.title}</p>
          </div>

          <div className="space-y-4">
            {/* Input Field: bKash Account Number */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Your bKash Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E2136E] focus:border-[#E2136E] outline-none transition-all bg-gray-50"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Input Field: PIN */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Enter PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="XXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E2136E] focus:border-[#E2136E] outline-none transition-all bg-gray-50"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 text-center">
             By clicking Confirm, you agree to the terms and conditions.
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-[#E2136E] hover:bg-[#c2105e] text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                Confirm Payment
              </>
            )}
          </button>
          
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <IoShieldCheckmark /> Secured by bKash
          </p>
        </form>
      </div>
    </div>
  );
}
