import { AxiosError } from "axios";

/**
 * Envelope de erro do backend.
 * O backend sempre responde { success: false, message, code } em erros tratados.
 */
export interface ApiErrorEnvelope {
  success: false;
  message: string;
  code?: string;
}

/** Erro do Axios com o envelope do backend já tipado em `response.data`. */
export type ApiError = AxiosError<ApiErrorEnvelope>;

/**
 * Extrai uma mensagem legível de um erro desconhecido.
 * Prioridade: response.data.message → error.message → fallback.
 */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Erro inesperado. Tente novamente.",
): string {
  if (err && typeof err === "object") {
    const axiosErr = err as ApiError;
    const backendMessage = axiosErr.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.length > 0) {
      return backendMessage;
    }
    if (axiosErr instanceof Error && axiosErr.message) {
      return axiosErr.message;
    }
  }
  return fallback;
}

/**
 * Extrai o code do envelope do backend, se existir.
 */
export function getApiErrorCode(err: unknown): string | undefined {
  if (err && typeof err === "object") {
    const axiosErr = err as ApiError;
    return axiosErr.response?.data?.code;
  }
  return undefined;
}
