import { FaDollarSign } from "react-icons/fa";
import { FaRegClock } from "react-icons/fa";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { FaRegStar } from "react-icons/fa6";
import { FaFlag } from "react-icons/fa6";

const statusColors = {
  pending: "bg-orange-500",
  applied: "bg-orange-500",
  shortlisted: "bg-blue-500",
  hired: "bg-green-500",
  completed: "bg-blue-500",
  rejected: "bg-red-500",
  withdrawn: "bg-gray-400",
};

export default function ProviderApplicationCards({
  items = [],
  onChat,
  onWithdraw,
  onMarkComplete,
  onReportClient,
}) {
  if (!items.length) {
    return <p className="text-gray-400 text-sm">No applications to display.</p>;
  }

  return (
    <>
      {items.map((item) => {
        const key = item.id || item._id;
        const status = item.status?.toLowerCase?.() ?? "pending";
        const statusLabel = item.statusLabel ?? item.status ?? "Pending";
        const budget = item.budget ?? item.proposedBudget ?? 0;
        const showWithdraw = item.canWithdraw && onWithdraw;
        const showComplete = item.canComplete && onMarkComplete;
        const showReport = item.canReport && onReportClient;

        return (
          <div
            key={key}
            className="p-5 rounded-xl border border-gray-300 shadow-sm hover:shadow-lg space-y-2 bg-white"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-800">
                {item.title}
              </h1>
              <div
                className={`text-white px-2 py-1 text-sm font-semibold rounded-full capitalize ${
                  statusColors[status] ?? "bg-blue-500"
                }`}
              >
                {statusLabel}
              </div>
              {item.status === "completed" && item.jobStatus === "completed" && item.paymentStatus !== "paid" ? (
                <div className="bg-orange-100 text-orange-600 px-2 py-1 text-sm font-semibold rounded-full border border-orange-200">
                  Unpaid
                </div>
              ) : item.status === "completed" && item.jobStatus === "completed" && item.paymentStatus === "paid" ? (
                <div className="bg-green-100 text-green-600 px-2 py-1 text-sm font-semibold rounded-full border border-green-200">
                  Paid
                </div>
              ) : null}
            </div>
            <p className="text-gray-500 text-sm">Client: {item.clientName}</p>
            <div className="flex flex-row items-center space-x-3 text-gray-500 text-sm">
              <div className="flex items-center gap-1">
                <FaDollarSign className="text-green-500" />
                <span>৳{budget}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaRegClock className="text-blue-500" />
                <span>{item.timeLabel}</span>
              </div>
            </div>
            <hr className="text-gray-300" />
            <div className="flex flex-col sm:flex-row gap-2 py-1 flex-wrap">
              {status !== "completed" && 
               status !== "withdrawn" && 
               status !== "rejected" && 
               item.jobStatus !== "completed" ? (
                <button
                  type="button"
                  onClick={() => onChat?.(item)}
                  className="flex-1 p-2 flex items-center justify-center gap-2 rounded-lg border border-gray-300 hover:bg-green-500 hover:text-white font-semibold transition-all duration-200 text-gray-700"
                >
                  <IoChatbubbleOutline />
                  <span>Chat</span>
                </button>
              ) : null}
              {showReport ? (
                <button
                  type="button"
                  onClick={() => onReportClient?.(item)}
                  className="flex-1 p-2 flex items-center justify-center gap-2 rounded-lg border border-gray-300 hover:bg-red-500 hover:text-white font-semibold transition-all duration-200 text-red-500"
                >
                  <FaFlag />
                  <span>Report</span>
                </button>
              ) : null}
              {showComplete ? (
                <button
                  type="button"
                  onClick={() => onMarkComplete?.(item)}
                  className="flex-1 p-2 flex items-center justify-center gap-2 rounded-lg border border-gray-300 hover:bg-green-500 hover:text-white font-semibold transition-all duration-200 text-blue-500"
                >
                  <FaRegCheckCircle />
                  <span>Mark Complete</span>
                </button>
              ) : null}
              {showWithdraw ? (
                <button
                  type="button"
                  onClick={() => onWithdraw?.(item)}
                  className="flex-1 p-2 flex items-center justify-center gap-2 rounded-lg border border-gray-300 hover:bg-red-500 hover:text-white font-semibold transition-all duration-200 text-red-500"
                >
                  <ImCross />
                  <span>Withdraw</span>
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </>
  );
}
