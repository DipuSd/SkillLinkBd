/**
 * Dashboard API
 */

import httpClient from "./httpClient";

/**
 * Get client dashboard stats
 */
export const getClientDashboard = async () => {
  const { data } = await httpClient.get("/api/client/dashboard");
  return data;
};

/**
 * Get client job history
 */
export const getClientHistory = async () => {
  const { data } = await httpClient.get("/api/client/history");
  return data;
};

/**
 * Get provider dashboard stats
 */
export const getProviderDashboard = async () => {
  const { data } = await httpClient.get("/api/provider/dashboard");
  return data;
};

/**
 * Get admin dashboard stats
 */
export const getAdminDashboard = async () => {
  const { data } = await httpClient.get("/api/admin/dashboard");
  return data;
};

/**
 * Get provider earnings history
 */
export const getProviderEarnings = async () => {
  const { data } = await httpClient.get("/api/provider/earnings");
  return data;
};

