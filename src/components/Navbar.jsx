import { Link } from "react-router-dom";
import { FaBoltLightning } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

/**
 * Navbar Component
 * 
 * Public top navigation bar.
 * Adapts based on authentication state (Login/Signup vs Dashboard link).
 */
function Navbar() {
  const { isAuthenticated, user } = useAuth();

  const primaryCta =
    user?.role === "client"
      ? "/client/dashboard"
      : user?.role === "provider"
      ? "/provider/dashboard"
      : "/admin/dashboard";

  return (
    <>
      <nav className="py-3 px-6 md:px-10 border-b border-gray-200 shadow-sm flex flex-row items-center justify-between bg-white">
        {/* logo section */}
        <Link
          to="/"
          className="flex flex-row items-center gap-2 cursor-pointer"
        >
          <div className="bg-teal-500 rounded-md p-1 text-orange-300">
            <FaBoltLightning size={24} />
          </div>
          <p className="font-bold text-xl text-teal-500">SkillMatch</p>
        </Link>
        {/* link and button holder */}
        <div className="flex items-center gap-2 font-semibold">
          <Link
            to="/#how-it-works"
            className="px-3 py-2 hover:bg-green-400 rounded-lg hover:text-white transition-all duration-200 text-sm md:text-base"
          >
            About
          </Link>
          <Link
            to="/#contact"
            className="px-3 py-2 hover:bg-green-400 rounded-lg hover:text-white transition-all duration-200 text-sm md:text-base"
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <Link
              to={primaryCta}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:opacity-85 transition-all duration-200 text-sm md:text-base"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-green-400 transition-all duration-200 hover:text-white cursor-pointer text-sm md:text-base"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:opacity-85 transition-all duration-200 text-sm md:text-base"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
export default Navbar;
