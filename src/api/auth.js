/**
 * Auth API
 */

import httpClient from "./httpClient";

/**
 * Register a new user
 * @param {Object} payload - User registration data
 */
export const registerUser = async (payload) => {
  const { data } = await httpClient.post("/api/auth/register", payload);
  return data;
};

/**
 * Login user
 * @param {Object} payload - Login credentials {email, password}
 */
export const loginUser = async (payload) => {
  const { data } = await httpClient.post("/api/auth/login", payload);
  return data;
};

/**
 * Get current user profile
 */
export const fetchProfile = async () => {
  const { data } = await httpClient.get("/api/auth/profile");
  return data;
};

/**
 * Update user profile
 * @param {Object} payload - Profile update data
 */
export const updateProfile = async (payload) => {
  const { data } = await httpClient.put("/api/users/me", payload);
  return data;
};

