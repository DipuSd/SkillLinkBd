/**
 * Notifications API
 */

import httpClient from "./httpClient";

/**
 * Get user notifications
 * @param {Object} params - { unreadOnly }
 */
export const getNotifications = async (params = {}) => {
  const { data } = await httpClient.get("/api/notifications", { params });
  return data;
};

/**
 * Mark single notification as read
 */
export const markNotificationRead = async (notificationId) => {
  const { data } = await httpClient.patch(
    `/api/notifications/${notificationId}/read`
  );
  return data;
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async () => {
  const { data } = await httpClient.patch("/api/notifications/read-all");
  return data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId) => {
  const { data } = await httpClient.delete(
    `/api/notifications/${notificationId}`
  );
  return data;
};

/**
 * Clear all notifications
 */
export const clearNotifications = async () => {
  const { data } = await httpClient.delete("/api/notifications");
  return data;
};

