import httpClient from "./httpClient";

export const getClientDashboard = async () => {
  const { data } = await httpClient.get("/api/client/dashboard");
  return data;
};

export const getClientHistory = async () => {
  const { data } = await httpClient.get("/api/client/history");
  return data;
};

export const getProviderDashboard = async () => {
  const { data } = await httpClient.get("/api/provider/dashboard");
  return data;
};

export const getAdminDashboard = async () => {
  const { data } = await httpClient.get("/api/admin/dashboard");
  return data;
};

export const getProviderEarnings = async () => {
  const { data } = await httpClient.get("/api/provider/earnings");
  return data;
};

