import httpClient from "./httpClient";

export const getUserById = async (userId) => {
  const { data } = await httpClient.get(`/api/users/${userId}`);
  return data;
};

export const listUsers = async (params = {}) => {
  const { data } = await httpClient.get("/api/admin/users", { params });
  return data;
};

export const updateUserStatus = async ({ userId, status }) => {
  const { data } = await httpClient.patch(`/api/admin/users/${userId}`, {
    status,
  });
  return data;
};

