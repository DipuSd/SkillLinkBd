/**
 * Users API
 */

import httpClient from "./httpClient";

/**
 * Get public user profile
 */
export const getUserById = async (userId) => {
  const { data } = await httpClient.get(`/api/users/${userId}`);
  return data;
};

/**
 * List users (Admin)
 * @param {Object} params - Filters
 */
export const listUsers = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/users", { params });
  return data;
};

/**
 * Update user status (Admin) - active/banned
 */
export const updateUserStatus = async ({ userId, status }) => {
  const { data } = await httpClient.patch(`/api/admin/users/${userId}`, {
    status,
  });
  return data;
};

/**
 * Delete a user (Admin)
 */
export const deleteUser = async (userId) => {
  await httpClient.delete(`/api/admin/users/${userId}`);
};

