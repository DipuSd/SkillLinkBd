import { TbLayoutDashboard } from "react-icons/tb";
import { FaUsersCog } from "react-icons/fa";
import { FaFlagCheckered } from "react-icons/fa";
import { MdWorkspacesOutline } from "react-icons/md";
import { IoChatbubbleOutline } from "react-icons/io5";
import DashboardLayout from "./DashboardLayout";

const adminMenu = [
  {
    label: "Dashboard",
    icon: <TbLayoutDashboard />,
    to: "/admin/dashboard",
    match: ["/admin/dashboard"],
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
  {
    label: "Jobs",
    icon: <MdWorkspacesOutline />,
    to: "/admin/jobs",
    match: ["/admin/jobs"],
  },
  {
    label: "Messaging",
    icon: <IoChatbubbleOutline />,
    to: "/admin/messages",
    match: ["/admin/messages"],
  },
];

function AdminLayout() {
  return (
    <DashboardLayout
      menuItems={adminMenu}
      notificationLink="/admin/notifications"
    />
  );
}

export default AdminLayout;

