import DashboardNavbar from "../../components/DashboardNavbar";
import DashboardSidebar from "../../components/DashboardSidebar";
import { TbLayoutDashboard } from "react-icons/tb";
import { FiPlusCircle } from "react-icons/fi";
import { IoPeopleOutline, IoPrintOutline } from "react-icons/io5";
import { IoChatbubbleOutline } from "react-icons/io5";
import { MdOutlineHistory } from "react-icons/md";
import ClientDashboard from "./ClientDashboard";
import ClientPostJob from "./ClientPostJob";
import ClientApplicant from "./ClientApplicant";
import ClientChat from "./ClientChat";
import ClientHistory from "./ClientHistory";
import NotificationCenter from "../NotificationCenter";

function ClientHomepage() {
  const menuItems = [
    { label: "Dashboard", icon: <TbLayoutDashboard /> },
    { label: "Post Job", icon: <FiPlusCircle /> },
    { label: "Applicants", icon: <IoPeopleOutline /> },
    { label: "Chat", icon: <IoChatbubbleOutline /> },
    { label: "History", icon: <MdOutlineHistory /> },
  ];

  return (
    <>
      <DashboardNavbar />
      <div className="flex">
        <div className="">
          <DashboardSidebar items={menuItems} />
        </div>
        <div className="flex-1 w-screen h-[calc(100vh-4rem)] overflow-y-auto">
          <NotificationCenter />
        </div>
      </div>
    </>
  );
}
export default ClientHomepage;
