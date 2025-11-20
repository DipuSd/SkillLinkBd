import DashboardNavbar from "../../components/DashboardNavbar";
import DashboardSidebar from "../../components/DashboardSidebar";
import ProviderDashboard from "./ProviderDashboard";
import ProviderJobs from "./ProviderJobs";
import ProviderApplications from "./ProviderApplications";
import ProviderEarnings from "./ProviderEarnings";
import ProviderProfile from "./ProviderProfile";
import { TbLayoutDashboard } from "react-icons/tb";
import { IoBagAddOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FaDollarSign } from "react-icons/fa";
import { IoPersonOutline } from "react-icons/io5";

export default function ProviderHomePage() {
  const menuItems = [
    {
      label: "Dashboard",
      icon: <TbLayoutDashboard />,
    },
    {
      label: "Jobs",
      icon: <IoBagAddOutline />,
    },
    {
      label: "Applications",
      icon: <IoDocumentTextOutline />,
    },
    {
      label: "Chat",
      icon: <IoChatbubbleOutline />,
    },
    {
      label: "Earnings",
      icon: <FaDollarSign />,
    },
    {
      label: "Profile",
      icon: <IoPersonOutline />,
    },
  ];
  return (
    <>
      <DashboardNavbar />
      <div className="flex">
        <div>
          <DashboardSidebar items={menuItems} />
        </div>
        <div className="flex-1 w-screen h-[calc(100vh-4rem)] overflow-y-auto">
          <ProviderProfile />
        </div>
      </div>
    </>
  );
}
