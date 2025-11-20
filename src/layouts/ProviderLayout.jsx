import { TbLayoutDashboard } from "react-icons/tb";
import { IoBagAddOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoChatbubbleOutline } from "react-icons/io5";
import { IoFlashOutline } from "react-icons/io5";
import { FaDollarSign } from "react-icons/fa";
import { IoPersonOutline } from "react-icons/io5";
import DashboardLayout from "./DashboardLayout";

const providerMenu = [
  {
    label: "Dashboard",
    icon: <TbLayoutDashboard />,
    to: "/provider/dashboard",
    match: ["/provider/dashboard"],
  },
  {
    label: "Jobs",
    icon: <IoBagAddOutline />,
    to: "/provider/jobs",
    match: ["/provider/jobs"],
  },
  {
    label: "Applications",
    icon: <IoDocumentTextOutline />,
    to: "/provider/applications",
    match: ["/provider/applications"],
  },
  {
    label: "Direct Jobs",
    icon: <IoFlashOutline />,
    to: "/provider/direct-jobs",
    match: ["/provider/direct-jobs"],
  },
  {
    label: "Chat",
    icon: <IoChatbubbleOutline />,
    to: "/provider/chat",
    match: ["/provider/chat"],
  },
  {
    label: "Earnings",
    icon: <FaDollarSign />,
    to: "/provider/earnings",
    match: ["/provider/earnings"],
  },
  {
    label: "Profile",
    icon: <IoPersonOutline />,
    to: "/provider/profile",
    match: ["/provider/profile"],
  },
];

function ProviderLayout() {
  return (
    <DashboardLayout
      menuItems={providerMenu}
      notificationLink="/provider/notifications"
    />
  );
}

export default ProviderLayout;

