// src/services/notifications.ts
import { api } from "./api";
import type { ApiEnvelope } from "../lib/api-envelope";
import type {
  NotificationFilters,
  NotificationsListResponse,
} from "../types/notification.types";

export async function fetchNotifications(
  filters?: NotificationFilters,
): Promise<NotificationsListResponse> {
  const { data } = await api.get<ApiEnvelope<NotificationsListResponse>>(
    "/me/notifications",
    {
      params: {
        unreadOnly: filters?.unreadOnly ? "true" : undefined,
        page: filters?.page,
        limit: filters?.limit,
      },
    },
  );
  return data.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiEnvelope<{ count: number }>>(
    "/me/notifications/unread-count",
  );
  return data.data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/me/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  const { data } = await api.patch<ApiEnvelope<{ updated: number }>>(
    "/me/notifications/read-all",
  );
  return data.data;
}
