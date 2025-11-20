import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ roles }) {
  const location = useLocation();
  const { isAuthenticated, isBooting, user } = useAuth();

  if (isBooting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-teal-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  if (roles && roles.length && !roles.includes(user.role)) {
    const fallback =
      user.role === "client"
        ? "/client/dashboard"
        : user.role === "provider"
        ? "/provider/dashboard"
        : "/admin/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

