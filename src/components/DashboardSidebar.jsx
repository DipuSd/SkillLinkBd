import { NavLink, useLocation } from "react-router-dom";

function DashboardSidebar({ items = [] }) {
  const location = useLocation();

  if (!items.length) {
    return null;
  }

  return (
    <>
      <aside className="w-64 bg-white h-[calc(100vh-4rem)] shadow-md flex flex-col px-3 py-4 border-r border-gray-100 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            item.match?.some((path) => location.pathname.startsWith(path)) ||
            location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive: navActive }) => {
                const active = navActive || isActive;
                return `flex items-center justify-between gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  active
                    ? "bg-cyan-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`;
              }}
            >
              <span className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </span>
              {typeof item.badge === "number" && item.badge > 0 ? (
                <span className="text-xs font-semibold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </aside>
    </>
  );
}
export default DashboardSidebar;
