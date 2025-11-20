import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IoCheckmarkDoneSharp } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { LuBell } from "react-icons/lu";
import NotificationCards from "../components/NotificationCards";
import {
  clearNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";

const filters = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

export default function NotificationCenter({ scope = "client" }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", { scope }],
    queryFn: () => getNotifications({ scope }),
    staleTime: 15_000,
  });

  const notifications = useMemo(
    () => data?.notifications ?? [],
    [data?.notifications]
  );
  const unreadCount = notifications.filter(
    (item) => !(item.isRead ?? item.IsRead)
  ).length;

  const filteredNotifications = useMemo(() => {
    if (selectedCategory === "all") return notifications;
    const shouldBeRead = selectedCategory === "read";
    return notifications.filter((item) => {
      const isRead = item.isRead ?? item.IsRead ?? false;
      return shouldBeRead ? isRead : !isRead;
    });
  }, [notifications, selectedCategory]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (notificationId) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <div className="flex flex-col m-4 space-y-6">
      {/* title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-gray-400">
            Stay updated with your activities and alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending || unreadCount === 0}
            className="p-2 rounded-lg font-semibold text-sm border border-gray-300 hover:bg-green-500 hover:text-white cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            <IoCheckmarkDoneSharp size={18} />
            <span>Mark All Read</span>
          </button>
          <button
            onClick={() => clearMutation.mutate()}
            disabled={clearMutation.isPending || notifications.length === 0}
            className="p-2 rounded-lg font-semibold text-sm text-red-500 cursor-pointer hover:bg-red-500 hover:text-white border border-gray-300 flex items-center gap-2 disabled:opacity-60"
          >
            <RiDeleteBin6Line size={18} />
            <span>Clear All</span>
          </button>
        </div>
      </div>
      {/* filter category */}
      <div className="flex items-center p-1 bg-gray-200 rounded-full w-fit font-semibold">
        {filters.map((filter) => (
          <button
            key={filter.value}
            className={`w-fit px-6 md:px-10 rounded-full cursor-pointer flex items-center gap-2 ${
              selectedCategory === filter.value ? "bg-white" : "text-gray-600"
            }`}
            onClick={() => setSelectedCategory(filter.value)}
          >
            {filter.value === "all" ? <LuBell size={18} /> : null}
            <span>
              {filter.label}
              {filter.value === "all"
                ? ` (${notifications.length})`
                : filter.value === "unread"
                ? ` (${unreadCount})`
                : ` (${notifications.length - unreadCount})`}
            </span>
          </button>
        ))}
      </div>
      {/* notification cards */}
      <div className="flex flex-col space-y-4 lg:mx-20">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-xl border border-gray-200 bg-gray-100 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <NotificationCards
            items={filteredNotifications}
            onMarkRead={(item) =>
              markReadMutation.mutate(item.id ?? item._id)
            }
            onDelete={(item) => deleteMutation.mutate(item.id ?? item._id)}
            emptyMessage="No notifications yet."
          />
        )}
      </div>
    </div>
  );
}
