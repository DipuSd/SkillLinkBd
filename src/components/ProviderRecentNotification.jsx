import { FaRegClock } from "react-icons/fa";

const typeColours = {
  accept: "bg-green-400",
  info: "bg-blue-400",
  reject: "bg-red-400",
  warning: "bg-orange-400",
};

export default function ProviderRecentNotification({ items = [] }) {
  if (!items.length) {
    return <p className="text-gray-400 text-sm">No notifications yet.</p>;
  }

  return (
    <>
      {items.map((item) => {
        const key = item._id ?? item.id ?? item.title;
        const type = item.type ?? "info";

        return (
          <div
            key={key}
            className="flex flex-row bg-gray-100 rounded-xl p-4 gap-3 border border-gray-200"
          >
            <div
              className={`relative top-2 rounded-full h-2 w-2 ${
                typeColours[type] ?? typeColours.info
              }`}
            ></div>
            <div className="space-y-1">
              <h1 className="text-sm font-semibold text-gray-800">
                {item.title}
              </h1>
              <p className="text-xs text-gray-600">{item.body}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FaRegClock className="text-gray-400" />
                <span>
                  {item.timeStamp
                    ? new Date(item.timeStamp).toLocaleString()
                    : ""}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
