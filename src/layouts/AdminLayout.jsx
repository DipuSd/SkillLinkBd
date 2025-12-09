import { TbLayoutDashboard } from "react-icons/tb";
import { FaUsersCog } from "react-icons/fa";
import { FaFlagCheckered } from "react-icons/fa";
import { MdInsights } from "react-icons/md";
import DashboardLayout from "./DashboardLayout";

const adminMenu = [
  {
    label: "Dashboard",
    icon: <TbLayoutDashboard />,
    to: "/admin/dashboard",
    match: ["/admin/dashboard"],
  },
  {
    label: "Insights",
    icon: <MdInsights />,
    to: "/admin/insights",
    match: ["/admin/insights"],
  },
  {
    label: "Users",
    icon: <FaUsersCog />,
    to: "/admin/users",
    match: ["/admin/users"],
  },
  {
    label: "Reports",
    icon: <FaFlagCheckered />,
    to: "/admin/reports",
    match: ["/admin/reports"],
  },
];

/**
 * AdminLayout Component
 * 
 * Defines the dashboard structure for Admin users.
 * Configures the side menu with Admin-specific links (Dashboard, Insights, Users, Reports).
 */
function AdminLayout() {
  return (
    <DashboardLayout
      menuItems={adminMenu}
      notificationLink="/admin/notifications"
    />
  );
}

export default AdminLayout;

