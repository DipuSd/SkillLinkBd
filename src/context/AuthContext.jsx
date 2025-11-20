/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchProfile,
  loginUser,
  registerUser,
  updateProfile,
} from "../api/auth";

const AuthContext = createContext(null);

const TOKEN_KEY = "skilllink_access_token";
const USER_KEY = "skilllink_user";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : ""
  );
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });
  const [isBooting, setIsBooting] = useState(Boolean(token));
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const persistAuth = useCallback((nextToken, nextUser) => {
    if (typeof window === "undefined") return;
    if (nextToken) {
      window.localStorage.setItem(TOKEN_KEY, nextToken);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }

    if (nextUser) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  }, []);

  const bootstrapProfile = useCallback(async () => {
    if (!token) {
      setIsBooting(false);
      return;
    }

    try {
      const profile = await fetchProfile();
      setUser(profile.user);
      persistAuth(token, profile.user);
    } catch {
      persistAuth("", null);
      setUser(null);
      setToken("");
    } finally {
      setIsBooting(false);
    }
  }, [token, persistAuth]);

  useEffect(() => {
    bootstrapProfile();
  }, [bootstrapProfile]);

  const handleLogin = useCallback(
    async (credentials) => {
      setError(null);
      const { token: nextToken, user: nextUser } = await loginUser(credentials);
      setToken(nextToken);
      setUser(nextUser);
      persistAuth(nextToken, nextUser);

      const redirectTo =
        location.state?.from?.pathname ||
        (nextUser.role === "client"
          ? "/client/dashboard"
          : nextUser.role === "provider"
          ? "/provider/dashboard"
          : "/admin");

      navigate(redirectTo, { replace: true });

      return nextUser;
    },
    [navigate, location.state, persistAuth]
  );

  const handleRegister = useCallback(
    async (payload) => {
      setError(null);
      try {
        const result = await registerUser(payload);
        if (result?.token && result?.user) {
          setToken(result.token);
          setUser(result.user);
          persistAuth(result.token, result.user);
        }

        const redirectTo =
          result?.user?.role === "client"
            ? "/client/dashboard"
            : result?.user?.role === "provider"
            ? "/provider/dashboard"
            : "/admin";

        navigate(redirectTo, { replace: true });

        return result.user;
      } catch (error) {
        setError(error);
        throw error; // Re-throw so SignUp.jsx can catch it
      }
    },
    [navigate, persistAuth]
  );

  const handleLogout = useCallback(() => {
    setToken("");
    setUser(null);
    persistAuth("", null);
    navigate("/login", { replace: true });
  }, [navigate, persistAuth]);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    try {
      const profile = await fetchProfile();
      setUser(profile.user);
      persistAuth(token, profile.user);
      return profile.user;
    } catch (refreshError) {
      setError(refreshError);
      return null;
    }
  }, [token, persistAuth]);

  const updateMyProfile = useCallback(
    async (payload) => {
      const updated = await updateProfile(payload);
      setUser(updated.user);
      persistAuth(token, updated.user);
      return updated.user;
    },
    [persistAuth, token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isBooting,
      error,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshProfile,
      updateProfile: updateMyProfile,
    }),
    [
      error,
      handleLogin,
      handleRegister,
      handleLogout,
      isBooting,
      refreshProfile,
      token,
      updateMyProfile,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

