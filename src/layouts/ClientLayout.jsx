import { TbLayoutDashboard } from "react-icons/tb";
import { FiPlusCircle } from "react-icons/fi";
import { IoPeopleOutline } from "react-icons/io5";
import { IoChatbubbleOutline } from "react-icons/io5";
import { MdOutlineHistory } from "react-icons/md";
import DashboardLayout from "./DashboardLayout";

const clientMenu = [
  {
    label: "Dashboard",
    icon: <TbLayoutDashboard />,
    to: "/client/dashboard",
    match: ["/client/dashboard"],
  },
  {
    label: "Post Job",
    icon: <FiPlusCircle />,
    to: "/client/jobs/new",
    match: ["/client/jobs"],
  },
  {
    label: "Applicants",
    icon: <IoPeopleOutline />,
    to: "/client/applicants",
    match: ["/client/applicants"],
  },
  {
    label: "Find Providers",
    icon: <IoPeopleOutline />,
    to: "/client/providers",
    match: ["/client/providers"],
  },
  {
    label: "Chat",
    icon: <IoChatbubbleOutline />,
    to: "/client/chat",
    match: ["/client/chat"],
  },
  {
    label: "History",
    icon: <MdOutlineHistory />,
    to: "/client/history",
    match: ["/client/history"],
  },
];

function ClientLayout() {
  return (
    <DashboardLayout
      menuItems={clientMenu}
      notificationLink="/client/notifications"
    />
  );
}

export default ClientLayout;

