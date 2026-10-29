// src/lib/api-envelope.ts

/**
 * Envelope padrão de sucesso do backend.
 * O backend sempre responde { success: true, data } em 2xx.
 * (Erros usam ApiErrorEnvelope em lib/api-error.ts.)
 */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}
