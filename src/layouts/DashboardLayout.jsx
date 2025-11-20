import { Outlet } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardSidebar from "../components/DashboardSidebar";

function DashboardLayout({ menuItems, notificationLink }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar notificationLink={notificationLink} />
      <div className="flex">
        <DashboardSidebar items={menuItems} />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-y-auto bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;

