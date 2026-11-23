// src/services/me.ts
import { api } from "./api";
import type { ApiEnvelope } from "../lib/api-envelope";
import type { User } from "../types/auth.types";
import type {
  ConfirmEmailChangePayload,
  RequestEmailChangePayload,
  SessionInfo,
  UpdateAvatarPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from "../types/auth.types";

export async function fetchMyProfile(): Promise<User> {
  const { data } = await api.get<ApiEnvelope<User>>("/me/profile");
  return data.data;
}

export async function updateMyProfile(
  payload: UpdateProfilePayload,
): Promise<User> {
  const { data } = await api.patch<ApiEnvelope<User>>("/me/profile", payload);
  return data.data;
}

export async function updateMyPassword(
  payload: UpdatePasswordPayload,
): Promise<void> {
  await api.patch("/me/password", payload);
}

export async function updateMyAvatar(
  payload: UpdateAvatarPayload,
): Promise<User> {
  const { data } = await api.patch<ApiEnvelope<User>>("/me/avatar", payload);
  return data.data;
}

export async function fetchMySessions(): Promise<SessionInfo[]> {
  const { data } = await api.get<ApiEnvelope<SessionInfo[]>>("/me/sessions");
  return data.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await api.delete(`/me/sessions/${sessionId}`);
}

export async function revokeAllSessions(): Promise<{ revoked: number }> {
  const { data } =
    await api.delete<ApiEnvelope<{ revoked: number }>>("/me/sessions");
  return data.data;
}

export async function requestEmailChange(
  payload: RequestEmailChangePayload,
): Promise<void> {
  await api.post("/me/email/request-change", payload);
}

export async function confirmEmailChange(
  payload: ConfirmEmailChangePayload,
): Promise<void> {
  await api.post("/me/email/confirm-change", payload);
}
