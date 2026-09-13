import type {
  AuthErrorResponse,
  AuthSessionResponse,
  SignInPayload,
} from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Faz login do usuário
 */
export async function signIn({
  email,
  password,
  rememberMe = true,
}: SignInPayload): Promise<AuthSessionResponse> {
  const response = await fetch(`${API_URL}/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      rememberMe,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as
    | AuthSessionResponse
    | AuthErrorResponse;

  if (!response.ok) {
    const errorMessage =
      "message" in data && data.message
        ? data.message
        : "Credenciais inválidas";
    throw new Error(errorMessage);
  }

  return data as AuthSessionResponse;
}

/**
 * Busca a sessão atual do usuário
 */
export async function getSession(): Promise<AuthSessionResponse | null> {
  try {
    const response = await fetch(`${API_URL}/auth/get-session`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) return null;

    const data = (await response
      .json()
      .catch(() => null)) as AuthSessionResponse | null;

    return data?.user ? data : null;
  } catch {
    return null;
  }
}

/**
 * Faz logout do usuário
 */
export async function signOut(): Promise<void> {
  await fetch(`${API_URL}/auth/sign-out`, {
    method: "POST",
    credentials: "include",
  });
}
