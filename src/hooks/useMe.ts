// src/hooks/useMe.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "../lib/api-error";
import {
  confirmEmailChange,
  fetchMyProfile,
  fetchMySessions,
  requestEmailChange,
  revokeAllSessions,
  revokeSession,
  updateMyAvatar,
  updateMyPassword,
  updateMyProfile,
} from "../services/me";
import type {
  ConfirmEmailChangePayload,
  RequestEmailChangePayload,
  UpdateAvatarPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload,
} from "../types/auth.types";

const ME_KEY = ["me", "profile"] as const;
const SESSIONS_KEY = ["me", "sessions"] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: fetchMyProfile,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateMyProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMyProfile(payload),
    onSuccess: (updated) => {
      qc.setQueryData(ME_KEY, updated);
      toast.success("Perfil atualizado.");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao atualizar perfil.")),
  });
}

export function useUpdateMyPassword() {
  return useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updateMyPassword(payload),
    onSuccess: () => toast.success("Senha alterada com sucesso."),
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao alterar senha.")),
  });
}

export function useUpdateMyAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateAvatarPayload) => updateMyAvatar(payload),
    onSuccess: (updated) => {
      qc.setQueryData(ME_KEY, updated);
      toast.success("Avatar atualizado.");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao atualizar avatar.")),
  });
}

export function useMySessions() {
  return useQuery({
    queryKey: SESSIONS_KEY,
    queryFn: fetchMySessions,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => revokeSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success("Sessão revogada.");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao revogar sessão.")),
  });
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeAllSessions(),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: SESSIONS_KEY });
      toast.success(`${res.revoked} sessão(ões) revogada(s).`);
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Erro ao revogar sessões.")),
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: (payload: RequestEmailChangePayload) =>
      requestEmailChange(payload),
    onSuccess: () =>
      toast.success(
        "Código enviado para o novo e-mail. Confirme para concluir.",
      ),
    onError: (err) =>
      toast.error(
        getApiErrorMessage(err, "Erro ao solicitar troca de e-mail."),
      ),
  });
}

export function useConfirmEmailChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfirmEmailChangePayload) =>
      confirmEmailChange(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ME_KEY });
      toast.success("E-mail alterado com sucesso.");
    },
    onError: (err) =>
      toast.error(getApiErrorMessage(err, "Código inválido ou expirado.")),
  });
}
