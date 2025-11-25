import { FaCheck } from "react-icons/fa";
import { FaInfo } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { ImCross } from "react-icons/im";
import { MdOutlineWarningAmber } from "react-icons/md";

const iconMap = {
  accept: {
    className: "bg-green-400",
    icon: <FaCheck size={20} />,
  },
  info: {
    className: "bg-blue-400",
    icon: <FaInfo size={20} />,
  },
  reject: {
    className: "bg-red-400",
    icon: <ImCross size={20} />,
  },
  warning: {
    className: "bg-orange-400",
    icon: <MdOutlineWarningAmber size={20} />,
  },
};

export default function NotificationCards({
  items = [],
  onMarkRead,
  onDelete,
  showActions = true,
  emptyMessage = "No notifications yet.",
}) {
  if (!items.length) {
    return (
      <div className="text-gray-400 text-sm text-center py-8">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {items.map((item) => {
        const isRead = item.isRead ?? item.IsRead ?? false;
        const key = item.id ?? item._id ?? item.timeStamp ?? item.title;
        const iconConfig = iconMap[item.type] ?? iconMap.info;

        return (
          <div
            key={key}
            className={`flex justify-between gap-4 px-4 py-5 rounded-xl border transition-all duration-200 ${
              isRead
                ? "border-gray-200 bg-white hover:shadow-md"
                : "border-l-4 border-l-blue-500 border-gray-200 bg-blue-50 hover:shadow-lg"
            }`}
          >
            {/* logo */}
            <div className="flex flex-1 gap-4 items-start">
              <div
                className={`${iconConfig.className} shadow-md text-white p-2 rounded-md h-fit`}
              >
                {iconConfig.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-semibold text-gray-800">
                    {item.title}
                  </h1>
                  {!isRead ? (
                    <span className="bg-blue-500 font-semibold px-2 rounded-full text-white text-xs">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="text-gray-500 text-sm">{item.body}</p>
                <p className="text-xs text-gray-400">
                  {item.timeStamp
                    ? new Date(item.timeStamp).toLocaleString()
                    : ""}
                </p>
              </div>
            </div>
            {/* buttons */}
            {showActions ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onMarkRead?.(item)}
                  className="p-2 rounded-lg hover:bg-green-500 hover:text-white cursor-pointer transition-colors"
                >
                  <IoCheckmarkDoneSharp size={18} />
                </button>
                <button
                  onClick={() => onDelete?.(item)}
                  className="p-2 rounded-lg hover:bg-red-500 hover:text-white cursor-pointer transition-colors"
                >
                  <RiDeleteBin6Line size={18} />
                </button>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
