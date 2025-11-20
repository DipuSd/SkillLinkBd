import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { FaBoltLightning } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [role, setRole] = useState("provider");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, isBooting, user } = useAuth();

  const handleButtonSelectionOnClick = (option) => {
    setRole(option);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login({ ...form, role });
    } catch (loginError) {
      const message =
        loginError?.response?.data?.message ||
        "Unable to log in. Please check your credentials.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isBooting && isAuthenticated) {
    const redirectTo =
      user?.role === "client"
        ? "/client/dashboard"
        : user?.role === "provider"
        ? "/provider/dashboard"
        : "/admin/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen gap-10 px-5 py-10 bg-[#e1f3fa]">
        {/* image container */}
        <div className="hidden lg:flex flex-col items-center justify-center transition-all duration-200">
          <img
            src="/homepage1.jpeg"
            alt="people looking at laptop"
            className="rounded-2xl max-w-2xl"
          />
          <div className="flex flex-col items-center text-center mt-4 space-y-1">
            <h2 className="font-semibold text-2xl text-gray-800">
              Welcome back!
            </h2>
            <p className="font-medium text-gray-500">
              Login to access your dashboard and connect with opportunities.
            </p>
          </div>
        </div>
        {/* form container */}
        <div className="bg-white shadow-lg rounded-2xl py-10 px-6 md:px-8 border border-gray-100 w-full max-w-lg">
          {/* logo section */}
          <Link
            to="/"
            className="flex flex-row items-center space-x-2 cursor-pointer"
          >
            <div className="bg-teal-500 rounded-md p-1 text-orange-300">
              <FaBoltLightning size={24} />
            </div>
            <p className="font-bold text-xl text-teal-500">SkillMatch</p>
          </Link>
          <p className="text-gray-400 mt-1 text-lg font-semibold">
            Login to your account to continue
          </p>
          {/* account type selector button */}
          <div className="flex flex-row bg-gray-100 rounded-full justify-between px-2 py-1 mt-4 gap-2">
            {["provider", "client", "admin"].map((option) => (
              <button
                key={option}
                type="button"
                className={`font-semibold rounded-full px-4 py-1 flex-1 capitalize cursor-pointer transition-colors ${
                  role === option ? "bg-white shadow-sm" : ""
                }`}
                onClick={() => handleButtonSelectionOnClick(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {/* Account info form*/}
          <div className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-700">Email</span>
                <input
                  name="email"
                  value={form.email}
                  type="email"
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="bg-gray-100 rounded-lg px-3 py-2 text-gray-600 font-semibold focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-700">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="bg-gray-100 rounded-lg px-3 py-2 text-gray-600 font-semibold focus:border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 outline-none"
                />
              </label>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-blue-500 text-sm">
                  Forgot password?
                </Link>
              </div>
              {error ? (
                <p className="text-sm text-red-500 font-semibold">{error}</p>
              ) : null}
              {/* login button */}
              <div className="flex justify-center mt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-400 rounded-md w-full cursor-pointer py-2 hover:opacity-90 disabled:opacity-70"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
            {/* google login section */}
            <div>
              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              {/* button */}
              <button
                type="button"
                className="w-full border border-gray-300 rounded-lg py-2 hover:bg-green-500 font-semibold hover:text-white cursor-pointer flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <FcGoogle size={20} />
                <span>Continue with Google</span>
              </button>
            </div>
            {/* signup section */}
            <hr className="text-gray-300 mt-6" />
            <div className="flex items-center justify-center py-5 gap-2">
              <p className="text-sm text-gray-400">
                Don't have an account?
              </p>
              <Link to="/signup" className="text-blue-500 hover:underline text-sm">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
