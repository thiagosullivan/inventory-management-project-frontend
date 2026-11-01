import type {
  AuthErrorResponse,
  AuthSessionResponse,
  SignInPayload,
  User,
} from "../types/auth.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * Faz login do usuário.
 * Retorna a sessão do better-auth (sem `sector`) — o AuthContext
 * deve chamar `getMe()` em seguida pra hidratar o `user` completo.
 */
export async function signIn({
  email,
  password,
  rememberMe = true,
}: SignInPayload): Promise<AuthSessionResponse> {
  const response = await fetch(`${API_URL}/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, rememberMe }),
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
 * Busca o usuário logado com `sector` incluso.
 * Endpoint próprio do backend: GET /me
 */
export async function getMe(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      credentials: "include",
    });

    if (response.status === 401) return null; // não logado
    if (!response.ok) return null;

    const data = (await response.json().catch(() => null)) as {
      user: User;
    } | null;

    return data?.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Mantido para compatibilidade (ex.: uso pontual do better-auth).
 * Não é mais usado pelo AuthContext.
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
