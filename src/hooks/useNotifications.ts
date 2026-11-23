// src/hooks/useNotifications.ts
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "../lib/api-error";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notifications";
import type { NotificationFilters } from "../types/notification.types";

const LIST_KEY = ["notifications", "list"] as const;
const COUNT_KEY = ["notifications", "unread-count"] as const;

export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: [
      ...LIST_KEY,
      filters?.unreadOnly ?? false,
      filters?.page ?? 1,
      filters?.limit ?? 20,
    ],
    queryFn: () => fetchNotifications(filters),
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: COUNT_KEY,
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao marcar notificação.")),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(`${res.updated} notificação(ões) marcada(s) como lida(s).`);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao marcar todas.")),
  });
}
