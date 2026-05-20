import apiClient from "@/lib/api";
import type { AppNotification, NotificationSummary } from "./types";

export const getNotifications = async (): Promise<NotificationSummary> => {
  const res = await apiClient.get("/notifications/");
  return res.data;
};

export const markNotificationAsRead = async (
  id: number
): Promise<AppNotification> => {
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data;
};
