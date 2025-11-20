import httpClient from "./httpClient";

export const getNotifications = async (params = {}) => {
  const { data } = await httpClient.get("/api/notifications", { params });
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await httpClient.patch(
    `/api/notifications/${notificationId}/read`
  );
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await httpClient.patch("/api/notifications/read-all");
  return data;
};

export const deleteNotification = async (notificationId) => {
  const { data } = await httpClient.delete(
    `/api/notifications/${notificationId}`
  );
  return data;
};

export const clearNotifications = async () => {
  const { data } = await httpClient.delete("/api/notifications");
  return data;
};

