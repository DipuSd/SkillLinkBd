import { Link, useLocation } from "react-router-dom";
import { FaBoltLightning } from "react-icons/fa6";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FiBell } from "react-icons/fi";
import { MdLogout } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/notifications";

function DashboardNavbar({ notificationLink = "/notifications" }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isChatRoute = location.pathname.includes("/chat");
  const isAdmin = user?.role === "admin";
  const { data } = useQuery({
    queryKey: ["notifications", { unreadOnly: true }],
    queryFn: () => getNotifications({ unreadOnly: true }),
    staleTime: 30_000,
    enabled: Boolean(user) && !isAdmin,
  });

  const unreadCount = data?.notifications?.length ?? 0;

  return (
    <>
      <nav className="flex flex-row items-center py-3 px-6 lg:px-12 shadow-md justify-between bg-white sticky top-0 z-40">
        {/* logo section */}
        <Link
          to="/"
          className="flex flex-row items-center space-x-2 cursor-pointer"
        >
          <div className="bg-teal-500 rounded-md p-1 text-orange-300">
            <FaBoltLightning size={24} />
          </div>
          <p className="font-bold text-2xl text-teal-500">SkillMatch</p>
        </Link>
        {/* links and profile section */}
        <div className="flex flex-row items-center gap-3">
          <span className="hidden md:flex flex-col items-end">
            <span className="font-semibold text-lg text-gray-800">
              {user?.name ?? "Unknown User"}
            </span>
            <span className="text-sm text-gray-400 capitalize">
              {user?.role ?? "user"}
            </span>
          </span>
          {/* chat button */}
          {!isAdmin ? (
            <Link
              to={`/${user?.role ?? "client"}/chat`}
              className={`hover:bg-green-600 hover:text-white p-2 rounded-xl cursor-pointer font-semibold transition-all duration-200 ${
                isChatRoute ? "bg-green-600 text-white" : ""
              }`}
            >
              <IoChatbubbleOutline size={18} />
            </Link>
          ) : null}
          {/* notification button */}
          {!isAdmin ? (
            <div className="flex items-center relative">
              <Link
                to={notificationLink}
                className="hover:bg-green-600 rounded-xl p-2 hover:text-white transition-all duration-200 cursor-pointer"
              >
                <FiBell size={18} />
              </Link>
              {unreadCount > 0 ? (
                <span className="bg-red-500 rounded-full absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
          {/* profile picture */}
          <div className="rounded-full border border-transparent hover:border-green-600 cursor-pointer transition-all duration-200 overflow-hidden w-12 h-12">
            <img
              src={user?.avatarUrl || "/sampleProfile.png"}
              alt="Users profile pic"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-base font-semibold text-gray-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-lg transition-colors"
          >
            <MdLogout size={16} />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}
export default DashboardNavbar;
