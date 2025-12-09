import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ClientDashboard from "./pages/Client/ClientDashboard";
import ClientPostJob from "./pages/Client/ClientPostJob";
import ClientApplicant from "./pages/Client/ClientApplicant";
import ClientChat from "./pages/Client/ClientChat";
import ClientHistory from "./pages/Client/ClientHistory";
import ViewProviderProfile from "./pages/Client/ViewProviderProfile";
import ClientBrowseProviders from "./pages/Client/ClientBrowseProviders";
import ClientProfile from "./pages/Client/ClientProfile";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderJobs from "./pages/provider/ProviderJobs";
import ProviderApplications from "./pages/provider/ProviderApplications";
import ProviderEarnings from "./pages/provider/ProviderEarnings";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderChat from "./pages/provider/ProviderChat";
import ProviderDirectJobs from "./pages/provider/ProviderDirectJobs";
import NotificationCenter from "./pages/NotificationCenter";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReports from "./pages/admin/AdminReports";
import AdminInsights from "./pages/admin/AdminInsights";
import AdminNotifications from "./pages/admin/AdminNotifications";
import ClientLayout from "./layouts/ClientLayout";
import ProviderLayout from "./layouts/ProviderLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

/**
 * App Component
 * 
 * Main application component.
 * - Wraps the app in AuthProvider.
 * - Defines all application routes (public, protected, and role-based).
 * - Maps paths to page components.
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<ProtectedRoute roles={["client"]} />}>
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="jobs/new" element={<ClientPostJob />} />
            <Route path="applicants" element={<ClientApplicant />} />
            <Route path="providers" element={<ClientBrowseProviders />} />
            <Route path="provider/:providerId" element={<ViewProviderProfile />} />
            <Route path="chat" element={<ClientChat />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="history" element={<ClientHistory />} />
            <Route
              path="notifications"
              element={<NotificationCenter scope="client" />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["provider"]} />}>
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="jobs" element={<ProviderJobs />} />
            <Route
              path="applications"
              element={<ProviderApplications />}
            />
            <Route path="direct-jobs" element={<ProviderDirectJobs />} />
            <Route path="earnings" element={<ProviderEarnings />} />
            <Route path="profile" element={<ProviderProfile />} />
            <Route path="chat" element={<ProviderChat />} />
            <Route
              path="notifications"
              element={<NotificationCenter scope="provider" />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="insights" element={<AdminInsights />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="reports" element={<AdminReports />} />
            <Route
              path="notifications"
              element={<AdminNotifications />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
