// src/types/notification.types.ts
export type NotificationType =
  | "TRANSFER_CREATED"
  | "TRANSFER_CONFIRMED"
  | "TRANSFER_REFUSED"
  | "TRANSFER_CANCELLED"
  | "REQUEST_CREATED"
  | "REQUEST_FINALIZED"
  | "REQUEST_REFUSED"
  | "STOCK_ALERT";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}
